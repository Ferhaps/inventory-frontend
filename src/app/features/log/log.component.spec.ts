import {
	beforeEach,
	describe,
	expect,
	it,
	type MockedObject,
	vi,
} from 'vitest';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { LoaderService } from '@ferhaps/easy-ui-lib';
import { of, throwError } from 'rxjs';
import { LogComponent } from './log.component';
import { LogService } from './data-access/log.service';
import { UserService } from '../users/data-access/user.service';
import { ProductService } from '../products/data-access/product.service';
import { CategoryService } from '../categories/data-access/category.service';
import { Log, User, Product, Category } from '../../shared/types';
import { FormsModule } from '@angular/forms';
import { MatAutocomplete } from '@angular/material/autocomplete';

describe('LogComponent', () => {
	let component: LogComponent;
	let fixture: ComponentFixture<LogComponent>;
	let logService: MockedObject<LogService>;
	let userService: MockedObject<UserService>;
	let productService: MockedObject<ProductService>;
	let categoryService: MockedObject<CategoryService>;
	let loaderService: MockedObject<LoaderService>;

	const mockLogs: Log[] = [
		{
			id: 'log1',
			timestamp: '2024-01-01T10:00:00Z',
			event: 'PRODUCT_CREATED',
			user: { id: 'user1', email: 'user1@test.com' },
			product: { id: 'product1', name: 'Test Product' },
			details: 'Product created',
		},
		{
			id: 'log2',
			timestamp: '2024-01-02T10:00:00Z',
			event: 'USER_LOGIN',
			user: { id: 'user2', email: 'user2@test.com' },
			details: 'User logged in',
		},
	];

	const mockUsers: User[] = [
		{
			id: 'user1',
			email: 'user1@test.com',
			role: 'ADMIN',
			createdAt: '2024-01-01T00:00:00.000Z',
			updatedAt: '2024-01-01T00:00:00.000Z',
		},
		{
			id: 'user2',
			email: 'user2@test.com',
			role: 'OPERATOR',
			createdAt: '2024-01-02T00:00:00.000Z',
			updatedAt: '2024-01-02T00:00:00.000Z',
		},
	];

	const mockProducts: Product[] = [
		{
			id: 'product1',
			name: 'Product 1',
			quantity: 10,
			newQuantity: 10,
			categoryId: 'cat1',
			createdAt: '2024-01-01',
			updatedAt: '2024-01-01',
		},
		{
			id: 'product2',
			name: 'Product 2',
			quantity: 20,
			newQuantity: 20,
			categoryId: 'cat2',
			createdAt: '2024-01-01',
			updatedAt: '2024-01-01',
		},
	];

	const mockCategories: Category[] = [
		{
			id: 'cat1',
			name: 'Category 1',
			createdAt: '2024-01-01T00:00:00.000Z',
			updatedAt: '2024-01-01T00:00:00.000Z',
		},
		{
			id: 'cat2',
			name: 'Category 2',
			createdAt: '2024-01-02T00:00:00.000Z',
			updatedAt: '2024-01-02T00:00:00.000Z',
		},
	];

	const mockLogEvents: string[] = [
		'PRODUCT_CREATED',
		'PRODUCT_UPDATED',
		'USER_LOGIN',
		'USER_LOGOUT',
	];

	/** MatAutocomplete stand-in — only `options.forEach` is ever touched. */
	const autoStub = (): MatAutocomplete =>
		({ options: { forEach: vi.fn() } }) as unknown as MatAutocomplete;

	/** Creates the component, runs ngOnInit, and settles the stores' promises. */
	const createComponent = async (): Promise<void> => {
		fixture = TestBed.createComponent(LogComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
		await fixture.whenStable();
		fixture.detectChanges();
	};

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [LogComponent, FormsModule, NoopAnimationsModule],
			providers: [
				provideZonelessChangeDetection(),
				provideRouter([]),
				{
					provide: LogService,
					useValue: { getLogs: vi.fn(), getLogEvents: vi.fn() },
				},
				{ provide: UserService, useValue: { getUsers: vi.fn() } },
				{ provide: ProductService, useValue: { getProducts: vi.fn() } },
				{ provide: CategoryService, useValue: { getCategories: vi.fn() } },
				{ provide: LoaderService, useValue: { setLoading: vi.fn() } },
			],
		});

		logService = TestBed.inject(LogService) as MockedObject<LogService>;
		userService = TestBed.inject(UserService) as MockedObject<UserService>;
		productService = TestBed.inject(
			ProductService,
		) as MockedObject<ProductService>;
		categoryService = TestBed.inject(
			CategoryService,
		) as MockedObject<CategoryService>;
		loaderService = TestBed.inject(
			LoaderService,
		) as MockedObject<LoaderService>;

		logService.getLogs.mockReturnValue(of(mockLogs));
		logService.getLogEvents.mockReturnValue(of(mockLogEvents));
		userService.getUsers.mockResolvedValue(mockUsers);
		productService.getProducts.mockReturnValue(of(mockProducts));
		categoryService.getCategories.mockResolvedValue(mockCategories);
	});

	describe('Component Initialization', () => {
		it('should create the component', async () => {
			await createComponent();

			expect(component).toBeTruthy();
		});

		it('should load initial data on init', async () => {
			await createComponent();

			expect(logService.getLogs).toHaveBeenCalled();
			expect(logService.getLogEvents).toHaveBeenCalled();
			expect(userService.getUsers).toHaveBeenCalled();
			expect(productService.getProducts).toHaveBeenCalled();
			expect(categoryService.getCategories).toHaveBeenCalled();
		});

		it('should populate logs array with data', async () => {
			await createComponent();

			expect(component['logs']?.length).toBe(2);
			expect(component['logs']).toEqual(mockLogs);
		});

		it('should populate filter options', async () => {
			await createComponent();

			expect(component['filteredLogEvents']()).toEqual(mockLogEvents);
			expect(component['filteredUsers']()).toEqual(mockUsers);
			expect(component['filteredProducts']).toEqual(mockProducts);
			expect(component['filteredCategories']()).toEqual(mockCategories);
		});

		it('should set loading state correctly', async () => {
			await createComponent();

			expect(loaderService.setLoading).toHaveBeenCalledWith(true);
			expect(loaderService.setLoading).toHaveBeenCalledWith(false);
		});

		it('should report no active filters on a fresh load', async () => {
			await createComponent();

			expect(component['isLogFiltered']()).toBe(false);
		});
	});

	describe('Date Filters', () => {
		beforeEach(async () => {
			await createComponent();
		});

		it('should filter logs by date range', async () => {
			const startDate = new Date('2024-01-01');
			const endDate = new Date('2024-01-02');

			component['range'].set({ start: startDate, end: endDate });
			component['onDateChange']();

			expect(logService.getLogs).toHaveBeenCalledWith(
				expect.objectContaining({ startDate, endDate }),
			);
		});

		it('should apply quick date filter', async () => {
			component['selectedDateFilter'].set('Today');
			component['onDateFilterChange']();

			expect(logService.getLogs).toHaveBeenCalled();
			expect(component['range']().start).toBeDefined();
			expect(component['range']().end).toBeDefined();
		});

		it('should set date range when quick filter is selected', async () => {
			component['selectedDateFilter'].set('This week');
			component['onDateFilterChange']();

			expect(component['range']().start).toBeDefined();
			expect(component['range']().end).toBeDefined();
		});

		it('should clear the range when no quick filter is selected', async () => {
			component['selectedDateFilter'].set('Today');
			component['onDateFilterChange']();

			component['selectedDateFilter'].set(undefined);
			component['onDateFilterChange']();

			expect(component['range']().start).toBeNull();
			expect(component['range']().end).toBeNull();
		});

		it('should promote a "more" filter into the quick filter slot', async () => {
			const firstQuick = component['quickDateFiltes']()[0];
			const promoted = component['moreFilters']()[1];

			component['switchQuickFilterPlaces'](promoted, 1);

			expect(component['quickDateFiltes']()[0]).toBe(promoted);
			expect(component['moreFilters']()[1]).toBe(firstQuick);
		});
	});

	describe('Event Filter', () => {
		beforeEach(async () => {
			await createComponent();
		});

		it('should filter logs by event type', async () => {
			logService.getLogs.mockClear();
			component['selectedEvent'].set('PRODUCT_CREATED');
			component['onEventOptionClick'](autoStub());

			expect(logService.getLogs).toHaveBeenCalledWith(
				expect.objectContaining({ event: 'PRODUCT_CREATED' }),
			);
		});

		it('should clear the event when the same option is clicked twice', async () => {
			component['selectedEvent'].set('PRODUCT_CREATED');
			component['onEventOptionClick'](autoStub());

			component['onEventOptionClick'](autoStub());

			expect(component['selectedEvent']()).toBe('');
			expect(component['filteredLogEvents']()).toEqual(mockLogEvents);
		});

		it('should filter event autocomplete options', async () => {
			component['filterAutocomplete']('events', 'PRODUCT');

			expect(
				component['filteredLogEvents']().length,
			).toBeLessThanOrEqual(mockLogEvents.length);
			expect(
				component['filteredLogEvents']().every((e: string) =>
					component['snakeCasePipe']
						.transform(e)
						.toLowerCase()
						.includes('product'),
				),
			).toBe(true);
		});

		it('should restore all events when the search term is cleared', async () => {
			component['filterAutocomplete']('events', 'PRODUCT');
			component['filterAutocomplete']('events', undefined);

			expect(component['filteredLogEvents']()).toEqual(mockLogEvents);
		});
	});

	describe('User Filter', () => {
		beforeEach(async () => {
			await createComponent();
		});

		it('should filter logs by user', async () => {
			logService.getLogs.mockClear();
			component['selectedUserId'].set('user1');
			component['searchUser'] = 'user1@test.com';
			component['onUsersClick'](autoStub());

			expect(logService.getLogs).toHaveBeenCalledWith(
				expect.objectContaining({ user: 'user1' }),
			);
		});

		it('should clear the user when the same option is clicked twice', async () => {
			component['selectedUserId'].set('user1');
			component['onUsersClick'](autoStub());

			component['onUsersClick'](autoStub());

			expect(component['selectedUserId']()).toBe('');
			expect(component['filteredUsers']()).toEqual(mockUsers);
		});

		it('should filter user autocomplete options', async () => {
			component['filterAutocomplete']('users', 'user1');

			expect(component['filteredUsers']().length).toBeLessThanOrEqual(
				mockUsers.length,
			);
			expect(
				component['filteredUsers']().every((u: User) =>
					u.email.toLowerCase().includes('user1'),
				),
			).toBe(true);
		});
	});

	describe('Product Filter', () => {
		beforeEach(async () => {
			await createComponent();
		});

		it('should filter logs by product', async () => {
			logService.getLogs.mockClear();
			component['selectedProductId'].set('product1');
			component['searchProduct'] = 'Product 1';
			component['onProductClick'](autoStub());

			expect(logService.getLogs).toHaveBeenCalledWith(
				expect.objectContaining({ product: 'product1' }),
			);
		});

		it('should filter product autocomplete options', async () => {
			component['filterAutocomplete']('products', 'Product 1');

			expect(component['filteredProducts'].length).toBeLessThanOrEqual(
				mockProducts.length,
			);
			expect(
				component['filteredProducts'].every((p: Product) =>
					p.name.toLowerCase().includes('product 1'),
				),
			).toBe(true);
		});
	});

	describe('Category Filter', () => {
		beforeEach(async () => {
			await createComponent();
		});

		it('should filter logs by category', async () => {
			logService.getLogs.mockClear();
			component['selectedCategoryId'].set('cat1');
			component['searchCategory'] = 'Category 1';
			component['onCategoryClick'](autoStub());

			expect(logService.getLogs).toHaveBeenCalledWith(
				expect.objectContaining({ category: 'cat1' }),
			);
		});

		it('should filter category autocomplete options', async () => {
			component['filterAutocomplete']('categories', 'Category 1');

			expect(component['filteredCategories']().length).toBeLessThanOrEqual(
				mockCategories.length,
			);
			expect(
				component['filteredCategories']().every((c: Category) =>
					c.name.toLowerCase().includes('category 1'),
				),
			).toBe(true);
		});
	});

	describe('Clear Filters', () => {
		beforeEach(async () => {
			await createComponent();
		});

		it('should clear all filters', async () => {
			component['selectedEvent'].set('PRODUCT_CREATED');
			component['selectedUserId'].set('user1');
			component['selectedProductId'].set('product1');
			component['selectedCategoryId'].set('cat1');
			component['selectedDateFilter'].set('Today');
			component['range'].set({ start: new Date(), end: new Date() });

			component['clearFilters'](autoStub());

			expect(component['selectedEvent']()).toBe('');
			expect(component['selectedUserId']()).toBeUndefined();
			expect(component['selectedProductId']()).toBeUndefined();
			expect(component['selectedCategoryId']()).toBeUndefined();
			expect(component['selectedDateFilter']()).toBeUndefined();
			expect(component['range']().start).toBeNull();
			expect(component['range']().end).toBeNull();
			expect(component['isLogFiltered']()).toBe(false);
		});

		it('should reload logs after clearing filters', async () => {
			component['selectedEvent'].set('PRODUCT_CREATED');
			logService.getLogs.mockClear();

			component['clearFilters'](autoStub());

			expect(logService.getLogs.mock.calls.length).toBe(1);
		});
	});

	describe('Infinite Scroll', () => {
		beforeEach(async () => {
			await createComponent();
		});

		it('should load more logs on scroll', async () => {
			component['stopScrolling'] = false;
			logService.getLogs.mockClear();
			logService.getLogs.mockReturnValue(of([...mockLogs]));

			component['onScroll']();
			await fixture.whenStable();

			expect(logService.getLogs.mock.calls.length).toBe(1);
		});

		it('should not load more logs if already fetching', async () => {
			logService.getLogs.mockClear();
			component['isFetching'].set(true);

			component['onScroll']();

			expect(logService.getLogs.mock.calls.length).toBe(0);
		});

		it('should set logs to new response', async () => {
			const newLogs: Log[] = [
				{
					id: 'log3',
					timestamp: '2024-01-03T10:00:00Z',
					event: 'CATEGORY_CREATED',
					user: { id: 'user1', email: 'user1@test.com' },
					category: { id: 'cat1', name: 'Category 1' },
					details: 'Category created',
				},
				{
					id: 'log4',
					timestamp: '2024-01-04T10:00:00Z',
					event: 'PRODUCT_UPDATED',
					user: { id: 'user2', email: 'user2@test.com' },
					product: { id: 'product2', name: 'Product 2' },
					details: 'Product updated',
				},
			];

			component['stopScrolling'] = false;
			logService.getLogs.mockClear();
			logService.getLogs.mockReturnValue(of(newLogs));

			component['onScroll']();
			await fixture.whenStable();

			expect(component['logs']).toEqual(newLogs);
		});

		it('should increase items per page on scroll', async () => {
			component['stopScrolling'] = false;
			logService.getLogs.mockClear();
			logService.getLogs.mockReturnValue(of([...mockLogs]));
			const initialItemsPerPage = component['itemsPerPage'];

			component['onScroll']();
			await fixture.whenStable();

			expect(component['itemsPerPage']).toBe(initialItemsPerPage + 50);
		});

		it('should stop scrolling if fewer items returned than page size', async () => {
			logService.getLogs.mockClear();
			logService.getLogs.mockReturnValue(of([mockLogs[0]]));

			component['onScroll']();
			await fixture.whenStable();

			expect(component['stopScrolling']).toBe(true);
		});

		it('should not load more logs if stopScrolling is true', async () => {
			logService.getLogs.mockClear();
			component['stopScrolling'] = true;

			component['onScroll']();

			expect(logService.getLogs.mock.calls.length).toBe(0);
		});

		it('should set isFetching to true then false after loading', async () => {
			let isFetchingDuringCall = false;
			component['stopScrolling'] = false;
			logService.getLogs.mockClear();
			logService.getLogs.mockImplementation(() => {
				isFetchingDuringCall = component['isFetching']();
				return of([...mockLogs]);
			});

			component['onScroll']();
			await fixture.whenStable();

			expect(isFetchingDuringCall).toBe(true);
			expect(component['isFetching']()).toBe(false);
		});
	});

	describe('Error Handling', () => {
		it('should handle errors when loading logs', async () => {
			logService.getLogs.mockReturnValue(
				throwError(() => new Error('Error loading logs')),
			);

			await createComponent();

			expect(loaderService.setLoading).toHaveBeenCalledWith(false);
			expect(component['isFetching']()).toBe(false);
		});

		it('should handle errors when loading users', async () => {
			userService.getUsers.mockRejectedValue(
				new Error('Error loading users'),
			);

			await createComponent();

			expect(component['filteredUsers']()).toEqual([]);
		});
	});
});
