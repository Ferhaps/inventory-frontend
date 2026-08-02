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
import { CategoriesComponent } from './categories.component';
import { MatDialog } from '@angular/material/dialog';
import { CategoryService } from './data-access/category.service';
import { AuthService } from '../../services/auth.service';
import { ConfirmDialogService, LoaderService } from '@ferhaps/easy-ui-lib';
import { Category, LoggedUserInfo } from '../../shared/types';
import { of } from 'rxjs';

describe('CategoriesComponent', () => {
	let component: CategoriesComponent;
	let fixture: ComponentFixture<CategoriesComponent>;
	let categoryService: MockedObject<CategoryService>;
	let authService: MockedObject<AuthService>;
	let loaderService: MockedObject<LoaderService>;
	let confirmDialog: MockedObject<ConfirmDialogService>;
	let dialog: MockedObject<MatDialog>;

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

	const mockAdminUser: LoggedUserInfo = {
		token: 'mock-token',
		user: {
			id: 'user1',
			email: 'admin@test.com',
			role: 'ADMIN',
			createdAt: '2024-01-01T00:00:00.000Z',
			updatedAt: '2024-01-01T00:00:00.000Z',
		},
	};

	const mockRegularUser: LoggedUserInfo = {
		token: 'mock-token',
		user: {
			id: 'user2',
			email: 'user@test.com',
			role: 'OPERATOR',
			createdAt: '2024-01-01T00:00:00.000Z',
			updatedAt: '2024-01-01T00:00:00.000Z',
		},
	};

	/**
	 * Creates the component and settles the store's async load. The first
	 * detectChanges runs the loading effect while the store is still 'loading';
	 * the second runs it again once the promise has resolved.
	 */
	const createComponent = async (): Promise<void> => {
		fixture = TestBed.createComponent(CategoriesComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
		await fixture.whenStable();
		fixture.detectChanges();
	};

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [CategoriesComponent],
			providers: [
				provideZonelessChangeDetection(),
				{
					provide: CategoryService,
					useValue: {
						getCategories: vi.fn(),
						addCategory: vi.fn(),
						deleteCategory: vi.fn(),
					},
				},
				{ provide: AuthService, useValue: { getLoggedUserInfo: vi.fn() } },
				{ provide: LoaderService, useValue: { setLoading: vi.fn() } },
				{ provide: ConfirmDialogService, useValue: { confirm: vi.fn() } },
			],
			// MatDialogModule is imported by the component itself, so a plain
			// provider would lose to it — override replaces it everywhere.
		}).overrideProvider(MatDialog, { useValue: { open: vi.fn() } });

		categoryService = TestBed.inject(
			CategoryService,
		) as MockedObject<CategoryService>;
		authService = TestBed.inject(AuthService) as MockedObject<AuthService>;
		loaderService = TestBed.inject(
			LoaderService,
		) as MockedObject<LoaderService>;
		confirmDialog = TestBed.inject(
			ConfirmDialogService,
		) as MockedObject<ConfirmDialogService>;
		dialog = TestBed.inject(MatDialog) as MockedObject<MatDialog>;

		authService.getLoggedUserInfo.mockReturnValue(mockRegularUser);
		categoryService.getCategories.mockResolvedValue(mockCategories);
		dialog.open.mockReturnValue({ afterClosed: () => of(undefined) } as never);
	});

	describe('Component Initialization', () => {
		it('should create the component', async () => {
			categoryService.getCategories.mockResolvedValue([]);

			await createComponent();

			expect(component).toBeTruthy();
		});

		it('should add actions column for ADMIN users', async () => {
			authService.getLoggedUserInfo.mockReturnValue(mockAdminUser);

			await createComponent();

			expect(component['displayedColumns']).toContain('actions');
		});

		it('should not add actions column for non-ADMIN users', async () => {
			await createComponent();

			expect(component['displayedColumns']).not.toContain('actions');
		});

		it('should load categories on init', async () => {
			await createComponent();

			expect(categoryService.getCategories).toHaveBeenCalled();
			expect(component['categories']()).toEqual(
				mockCategories.map((c) => ({ ...c, actions: ['Delete'] })),
			);
		});

		it('should set loading state correctly', async () => {
			await createComponent();

			expect(loaderService.setLoading).toHaveBeenCalledWith(true);
			expect(loaderService.setLoading).toHaveBeenCalledWith(false);
		});

		it('should leave the list empty when loading fails', async () => {
			categoryService.getCategories.mockRejectedValue(new Error('Load failed'));

			await createComponent();

			expect(component['categories']()).toEqual([]);
		});
	});

	describe('Add Category', () => {
		beforeEach(async () => {
			await createComponent();
		});

		it('should add new category to list when dialog returns category', async () => {
			const newCategory: Category = {
				id: 'cat4',
				name: 'New Category',
				createdAt: '2024-01-04T00:00:00.000Z',
				updatedAt: '2024-01-04T00:00:00.000Z',
			};
			dialog.open.mockReturnValue({
				afterClosed: () => of(newCategory),
			} as never);
			const initialLength = component['categories']().length;

			component['openAddCategoryPopup']();
			await fixture.whenStable();

			expect(component['categories']().length).toBe(initialLength + 1);
			expect(component['categories']()[0]).toEqual({
				...newCategory,
				actions: ['Delete'],
			});
		});

		it('should not add category when dialog is cancelled', async () => {
			const initialLength = component['categories']().length;

			component['openAddCategoryPopup']();
			await fixture.whenStable();

			expect(categoryService.addCategory).not.toHaveBeenCalled();
			expect(component['categories']().length).toBe(initialLength);
		});
	});

	describe('Delete Category', () => {
		beforeEach(async () => {
			categoryService.deleteCategory.mockReturnValue(of({}));
			await createComponent();
		});

		it('should open delete confirmation dialog', async () => {
			confirmDialog.confirm.mockResolvedValue(false);

			component['selectOption'](mockCategories[0], 'Delete');
			await fixture.whenStable();

			expect(confirmDialog.confirm).toHaveBeenCalledWith(
				expect.objectContaining({ confirmText: 'Delete', danger: true }),
			);
		});

		it('should delete category when confirmed', async () => {
			confirmDialog.confirm.mockResolvedValue(true);
			const initialLength = component['categories']().length;

			component['selectOption'](mockCategories[0], 'Delete');
			await fixture.whenStable();

			expect(categoryService.deleteCategory).toHaveBeenCalledWith('cat1');
			expect(component['categories']().length).toBe(initialLength - 1);
			expect(
				component['categories']().find((c) => c.id === 'cat1'),
			).toBeUndefined();
		});

		it('should not delete category when cancelled', async () => {
			confirmDialog.confirm.mockResolvedValue(false);
			const initialLength = component['categories']().length;

			component['selectOption'](mockCategories[0], 'Delete');
			await fixture.whenStable();

			expect(categoryService.deleteCategory).not.toHaveBeenCalled();
			expect(component['categories']().length).toBe(initialLength);
		});

		it('should ignore unknown actions', async () => {
			component['selectOption'](mockCategories[0], 'Edit');
			await fixture.whenStable();

			expect(confirmDialog.confirm).not.toHaveBeenCalled();
			expect(categoryService.deleteCategory).not.toHaveBeenCalled();
		});
	});
});
