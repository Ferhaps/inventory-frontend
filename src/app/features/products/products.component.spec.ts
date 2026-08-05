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
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ProductsComponent } from './products.component';
import { ProductService } from './data-access/product.service';
import { CategoryService } from '../categories/data-access/category.service';
import { AuthService } from '../../services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialogService, LoaderService } from '@ferhaps/easy-ui-lib';
import { of, throwError } from 'rxjs';
import { Category, Product, LoggedUserInfo } from '../../shared/types';
import { MatChipListboxChange } from '@angular/material/chips';

describe('ProductsComponent', () => {
	let component: ProductsComponent;
	let fixture: ComponentFixture<ProductsComponent>;
	let productService: MockedObject<ProductService>;
	let categoryService: MockedObject<CategoryService>;
	let authService: MockedObject<AuthService>;
	let loaderService: MockedObject<LoaderService>;
	let confirmDialog: MockedObject<ConfirmDialogService>;
	let snackBar: MockedObject<MatSnackBar>;
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

	const makeProducts = (): Product[] => [
		{
			id: 'prod1',
			name: 'Product 1',
			quantity: 10,
			categoryId: 'cat1',
			createdAt: '2024-01-01T00:00:00.000Z',
			updatedAt: '2024-01-01T00:00:00.000Z',
			newQuantity: 10,
		},
		{
			id: 'prod2',
			name: 'Widget 2',
			quantity: 20,
			categoryId: 'cat1',
			createdAt: '2024-01-02T00:00:00.000Z',
			updatedAt: '2024-01-02T00:00:00.000Z',
			newQuantity: 20,
		},
		{
			id: 'prod3',
			name: 'Product 3',
			quantity: 15,
			categoryId: 'cat2',
			createdAt: '2024-01-03T00:00:00.000Z',
			updatedAt: '2024-01-03T00:00:00.000Z',
			newQuantity: 15,
		},
	];

	let mockProducts: Product[];

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
	 * Creates the component and settles both async hops: the categories store's
	 * promise, then the effect that fetches products once categories arrive.
	 */
	const createComponent = async (): Promise<void> => {
		fixture = TestBed.createComponent(ProductsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
		await fixture.whenStable();
		fixture.detectChanges();
	};

	beforeEach(() => {
		mockProducts = makeProducts();

		TestBed.configureTestingModule({
			imports: [ProductsComponent, NoopAnimationsModule],
			providers: [
				provideZonelessChangeDetection(),
				{
					provide: ProductService,
					useValue: {
						getProducts: vi.fn(),
						addProduct: vi.fn(),
						updateProductQuantity: vi.fn(),
						deleteProduct: vi.fn(),
					},
				},
				{ provide: CategoryService, useValue: { getCategories: vi.fn() } },
				{ provide: AuthService, useValue: { getLoggedUserInfo: vi.fn() } },
				{ provide: LoaderService, useValue: { setLoading: vi.fn() } },
				{ provide: ConfirmDialogService, useValue: { confirm: vi.fn() } },
				{ provide: MatSnackBar, useValue: { open: vi.fn() } },
			],
			// MatDialogModule is imported by the component itself, so a plain
			// provider would lose to it — override replaces it everywhere.
		}).overrideProvider(MatDialog, { useValue: { open: vi.fn() } });

		productService = TestBed.inject(
			ProductService,
		) as MockedObject<ProductService>;
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
		snackBar = TestBed.inject(MatSnackBar) as MockedObject<MatSnackBar>;
		dialog = TestBed.inject(MatDialog) as MockedObject<MatDialog>;

		authService.getLoggedUserInfo.mockReturnValue(mockRegularUser);
		categoryService.getCategories.mockResolvedValue(mockCategories);
		productService.getProducts.mockReturnValue(of(mockProducts));
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

		it('should load categories and products on init', async () => {
			await createComponent();

			expect(categoryService.getCategories).toHaveBeenCalled();
			expect(productService.getProducts).toHaveBeenCalled();
			expect(component['categories']()).toEqual(mockCategories);
			expect(component['allProducts']).toEqual(mockProducts);
		});

		it('should select the first category by default', async () => {
			await createComponent();

			expect(component['currentCategoryId']()).toBe('cat1');
			expect(component['tableDataSource']().length).toBe(2);
		});

		it('should clear the loading state once products arrive', async () => {
			await createComponent();

			expect(loaderService.setLoading).toHaveBeenCalledWith(false);
		});

		it('should handle empty categories gracefully', async () => {
			categoryService.getCategories.mockResolvedValue([]);

			await createComponent();

			expect(productService.getProducts).not.toHaveBeenCalled();
			expect(component['tableDataSource']()).toEqual([]);
		});
	});

	describe('Category Selection', () => {
		beforeEach(async () => {
			await createComponent();
		});

		it('should filter products by selected category', async () => {
			component['showProductsForCategory']({
				value: 'cat1',
			} as MatChipListboxChange);

			const displayedProducts = component['tableDataSource']();
			expect(displayedProducts.length).toBe(2);
			expect(displayedProducts.every((p) => p.categoryId === 'cat1')).toBe(true);
		});

		it('should update displayed products when category changes', async () => {
			component['showProductsForCategory']({
				value: 'cat2',
			} as MatChipListboxChange);

			expect(component['currentCategoryId']()).toBe('cat2');
			const displayedProducts = component['tableDataSource']();
			expect(displayedProducts.length).toBe(1);
			expect(displayedProducts[0].categoryId).toBe('cat2');
		});

		it('should keep the current category when a chip is deselected', async () => {
			component['showProductsForCategory']({
				value: 'cat2',
			} as MatChipListboxChange);
			component['showProductsForCategory']({
				value: undefined,
			} as MatChipListboxChange);

			expect(component['currentCategoryId']()).toBe('cat2');
			expect(component['categoryChips']().value).toBe('cat2');
		});

		it('should reset the search term when the category changes', async () => {
			component['onSearch']('Widget');
			component['showProductsForCategory']({
				value: 'cat2',
			} as MatChipListboxChange);

			expect(component['searchTerm']()).toBe('');
		});

		it('should initialize newQuantity field for products', async () => {
			component['setCurrentProducts']();

			component['tableDataSource']().forEach((product) => {
				expect(product.newQuantity).toBe(product.quantity);
			});
		});
	});

	describe('Search', () => {
		beforeEach(async () => {
			await createComponent();
		});

		it('should sort matching products to the top', async () => {
			component['onSearch']('Widget');

			const displayed = component['tableDataSource']();
			expect(displayed.length).toBe(2);
			expect(displayed[0].id).toBe('prod2');
		});

		it('should clear the term when given a non-string event', async () => {
			component['onSearch']('Widget');
			component['onSearch'](new Event('input'));

			expect(component['searchTerm']()).toBe('');
		});
	});

	describe('Product Quantity Update', () => {
		beforeEach(async () => {
			await createComponent();
		});

		it('should update product quantity successfully', async () => {
			productService.updateProductQuantity.mockReturnValue(of({}));
			const product = { ...mockProducts[0], newQuantity: 25 };

			component['updateQuantity'](product);
			await fixture.whenStable();

			expect(productService.updateProductQuantity).toHaveBeenCalledWith(
				'prod1',
				25,
			);
			expect(component['allProducts'][0].quantity).toBe(25);
			expect(snackBar.open).toHaveBeenCalled();
		});

		it('should revert to original quantity on update error', async () => {
			productService.updateProductQuantity.mockReturnValue(
				throwError(() => new Error('Update failed')),
			);
			const originalQuantity = mockProducts[0].quantity;
			const product = { ...mockProducts[0], newQuantity: 25 };

			component['updateQuantity'](product);
			await fixture.whenStable();

			expect(productService.updateProductQuantity).toHaveBeenCalled();
			expect(component['tableDataSource']()[0].newQuantity).toBe(
				originalQuantity,
			);
		});
	});

	describe('Add Product Dialog', () => {
		beforeEach(async () => {
			await createComponent();
		});

		it('should add new product to list when dialog returns product', async () => {
			const newProduct: Product = {
				id: 'prod4',
				name: 'New Product',
				quantity: 5,
				categoryId: 'cat1',
				createdAt: '2024-01-04T00:00:00.000Z',
				updatedAt: '2024-01-04T00:00:00.000Z',
				newQuantity: 5,
			};
			dialog.open.mockReturnValue({
				afterClosed: () => of(newProduct),
			} as never);
			const initialLength = component['allProducts'].length;

			component['openAddProductPopup']();
			await fixture.whenStable();

			expect(component['allProducts'].length).toBe(initialLength + 1);
			expect(component['allProducts']).toContain(newProduct);
		});

		it('should pass the current category to the popup', async () => {
			component['openAddProductPopup']();

			expect(dialog.open).toHaveBeenCalledWith(
				expect.anything(),
				expect.objectContaining({ data: 'cat1' }),
			);
		});

		it('should not add product when dialog is cancelled', async () => {
			const initialLength = component['allProducts'].length;

			component['openAddProductPopup']();
			await fixture.whenStable();

			expect(productService.addProduct).not.toHaveBeenCalled();
			expect(component['allProducts'].length).toBe(initialLength);
		});
	});

	describe('Delete Product', () => {
		beforeEach(async () => {
			authService.getLoggedUserInfo.mockReturnValue(mockAdminUser);
			productService.deleteProduct.mockReturnValue(of({}));
			await createComponent();
		});

		it('should open delete confirmation dialog', async () => {
			confirmDialog.confirm.mockResolvedValue(false);

			component['selectOption'](mockProducts[0], 'Delete');
			await fixture.whenStable();

			expect(confirmDialog.confirm).toHaveBeenCalledWith(
				expect.objectContaining({ confirmText: 'Delete', danger: true }),
			);
		});

		it('should delete product when confirmed', async () => {
			confirmDialog.confirm.mockResolvedValue(true);
			const initialLength = component['allProducts'].length;

			component['selectOption'](mockProducts[0], 'Delete');
			await fixture.whenStable();

			expect(productService.deleteProduct).toHaveBeenCalledWith('prod1');
			expect(component['allProducts'].length).toBe(initialLength - 1);
			expect(
				component['allProducts'].find((p) => p.id === 'prod1'),
			).toBeUndefined();
		});

		it('should not delete product when cancelled', async () => {
			confirmDialog.confirm.mockResolvedValue(false);
			const initialLength = component['allProducts'].length;

			component['selectOption'](mockProducts[0], 'Delete');
			await fixture.whenStable();

			expect(productService.deleteProduct).not.toHaveBeenCalled();
			expect(component['allProducts'].length).toBe(initialLength);
		});

		it('should ignore unknown actions', async () => {
			component['selectOption'](mockProducts[0], 'Edit');
			await fixture.whenStable();

			expect(confirmDialog.confirm).not.toHaveBeenCalled();
			expect(productService.deleteProduct).not.toHaveBeenCalled();
		});
	});

	describe('Error Handling', () => {
		it('should handle category loading error', async () => {
			categoryService.getCategories.mockRejectedValue(new Error('Load failed'));

			await createComponent();

			expect(component['categories']()).toEqual([]);
			expect(productService.getProducts).not.toHaveBeenCalled();
		});

		it('should handle product loading error', async () => {
			productService.getProducts.mockReturnValue(
				throwError(() => new Error('Load failed')),
			);

			await createComponent();

			expect(loaderService.setLoading).toHaveBeenCalledWith(false);
			expect(component['tableDataSource']()).toEqual([]);
		});
	});
});
