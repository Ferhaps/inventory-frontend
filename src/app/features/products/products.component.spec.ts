import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductsComponent } from './products.component';
import { ProductService } from './data-access/product.service';
import { CategoryService } from '../categories/data-access/category.service';
import { AuthService } from '../../services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { LoaderService } from '@ferhaps/easy-ui-lib';
import { of, throwError } from 'rxjs';
import { Category, Product, LoggedUserInfo } from '../../shared/types';
import { MatChipListboxChange } from '@angular/material/chips';

describe('ProductsComponent', () => {
  let component: ProductsComponent;
  let fixture: ComponentFixture<ProductsComponent>;
  let productService: jasmine.SpyObj<ProductService>;
  let categoryService: jasmine.SpyObj<CategoryService>;
  let authService: jasmine.SpyObj<AuthService>;
  let loaderService: jasmine.SpyObj<LoaderService>;
  let dialog: MatDialog;

  const mockCategories: Category[] = [
    { id: 'cat1', name: 'Category 1' },
    { id: 'cat2', name: 'Category 2' }
  ];

  const mockProducts: Product[] = [
    {
      id: 'prod1',
      name: 'Product 1',
      quantity: 10,
      categoryId: 'cat1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      newQuantity: 10
    },
    {
      id: 'prod2',
      name: 'Product 2',
      quantity: 20,
      categoryId: 'cat1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      newQuantity: 20
    },
    { 
      id: 'prod3',
      name: 'Product 3',
      quantity: 15,
      categoryId: 'cat2',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      newQuantity: 15
    }
  ];

  const mockAdminUser: LoggedUserInfo = {
    token: 'mock-token',
    user: { id: 'user1', email: 'admin@test.com', role: 'ADMIN' }
  };

  const mockRegularUser: LoggedUserInfo = {
    token: 'mock-token',
    user: { id: 'user2', email: 'user@test.com', role: 'OPERATOR' }
  };

  beforeEach(async () => {
    const productServiceSpy = jasmine.createSpyObj('ProductService', [
      'getProducts',
      'addProduct',
      'updateProductQuantity',
      'deleteProduct'
    ]);
    const categoryServiceSpy = jasmine.createSpyObj('CategoryService', ['getCategories']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getLoggedUserInfo']);
    const loaderServiceSpy = jasmine.createSpyObj('LoaderService', ['setLoading']);
    
    await TestBed.configureTestingModule({
      imports: [
        ProductsComponent
      ],
      providers: [
        { provide: ProductService, useValue: productServiceSpy },
        { provide: CategoryService, useValue: categoryServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: LoaderService, useValue: loaderServiceSpy },
      ]
    })
    .overrideProvider(MatDialog, {
      useValue: {
        open: jasmine.createSpy('open').and.returnValue({ afterClosed: () => of(undefined) })
      }
    })
    .compileComponents();

    productService = TestBed.inject(ProductService) as jasmine.SpyObj<ProductService>;
    categoryService = TestBed.inject(CategoryService) as jasmine.SpyObj<CategoryService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    loaderService = TestBed.inject(LoaderService) as jasmine.SpyObj<LoaderService>;
    dialog = TestBed.inject(MatDialog);
  });

  describe('Component Initialization', () => {
    it('should create the component', () => {
      authService.getLoggedUserInfo.and.returnValue(mockRegularUser);
      categoryService.getCategories.and.returnValue(of([]));
      
      fixture = TestBed.createComponent(ProductsComponent);
      component = fixture.componentInstance;
      
      expect(component).toBeTruthy();
    });

    it('should add actions column for ADMIN users', () => {
      authService.getLoggedUserInfo.and.returnValue(mockAdminUser);
      categoryService.getCategories.and.returnValue(of(mockCategories));
      productService.getProducts.and.returnValue(of(mockProducts));
      
      fixture = TestBed.createComponent(ProductsComponent);
      component = fixture.componentInstance;
      
      expect(component['displayedColumns']).toContain('actions');
    });

    it('should not add actions column for non-ADMIN users', () => {
      authService.getLoggedUserInfo.and.returnValue(mockRegularUser);
      categoryService.getCategories.and.returnValue(of(mockCategories));
      productService.getProducts.and.returnValue(of(mockProducts));
      
      fixture = TestBed.createComponent(ProductsComponent);
      component = fixture.componentInstance;

      expect(component['displayedColumns']).not.toContain('actions');
    });

    it('should load categories and products on init', () => {
      authService.getLoggedUserInfo.and.returnValue(mockRegularUser);
      categoryService.getCategories.and.returnValue(of(mockCategories));
      productService.getProducts.and.returnValue(of(mockProducts));
      
      fixture = TestBed.createComponent(ProductsComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      
      expect(categoryService.getCategories).toHaveBeenCalled();
      expect(productService.getProducts).toHaveBeenCalled();
      expect(component['categories']).toEqual(mockCategories);
      expect(component['allProducts']).toEqual(mockProducts);
    });

    it('should set loading state correctly', () => {
      authService.getLoggedUserInfo.and.returnValue(mockRegularUser);
      categoryService.getCategories.and.returnValue(of(mockCategories));
      productService.getProducts.and.returnValue(of(mockProducts));
      
      fixture = TestBed.createComponent(ProductsComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      
      expect(loaderService.setLoading).toHaveBeenCalledWith(true);
      expect(loaderService.setLoading).toHaveBeenCalledWith(false);
    });

    it('should handle empty categories gracefully', () => {
      authService.getLoggedUserInfo.and.returnValue(mockRegularUser);
      categoryService.getCategories.and.returnValue(of([]));
      
      fixture = TestBed.createComponent(ProductsComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      
      expect(productService.getProducts).not.toHaveBeenCalled();
      expect(loaderService.setLoading).toHaveBeenCalledWith(false);
    });
  });

  describe('Category Selection', () => {
    beforeEach(() => {
      authService.getLoggedUserInfo.and.returnValue(mockRegularUser);
      categoryService.getCategories.and.returnValue(of(mockCategories));
      productService.getProducts.and.returnValue(of(mockProducts));
      
      fixture = TestBed.createComponent(ProductsComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should filter products by selected category', () => {
      component['showProductsOfCategory']({ value: 'cat1' } as MatChipListboxChange);

      const displayedProducts = component['tableDataSource']();
      expect(displayedProducts.length).toBe(2);
      expect(displayedProducts.every(p => p.categoryId === 'cat1')).toBe(true);
    });

    it('should update displayed products when category changes', () => {
      const event = { value: 'cat2' } as MatChipListboxChange;

      component['showProductsOfCategory'](event);

      expect(component['currentCategoryId']).toBe('cat2');
      const displayedProducts = component['tableDataSource']();
      expect(displayedProducts.length).toBe(1);
      expect(displayedProducts[0].categoryId).toBe('cat2');
    });

    it('should initialize newQuantity field for products', () => {
      component['setCurrentProducts']();

      const displayedProducts = component['tableDataSource']();
      displayedProducts.forEach(product => {
        expect(product.newQuantity).toBe(product.quantity);
      });
    });
  });

  describe('Product Quantity Update', () => {
    beforeEach(() => {
      authService.getLoggedUserInfo.and.returnValue(mockRegularUser);
      categoryService.getCategories.and.returnValue(of(mockCategories));
      productService.getProducts.and.returnValue(of(mockProducts));
      
      fixture = TestBed.createComponent(ProductsComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should update product quantity successfully', () => {
      productService.updateProductQuantity.and.returnValue(of({}));
      const product = { ...mockProducts[0], newQuantity: 25 };

      component['updateQuantity'](product);

      expect(productService.updateProductQuantity).toHaveBeenCalledWith('prod1', 25);
      expect(component['allProducts'][0].quantity).toBe(25);
    });

    it('should revert to original quantity on update error', () => {
      productService.updateProductQuantity.and.returnValue(throwError(() => new Error('Update failed')));
      const product = { ...mockProducts[0], newQuantity: 25 };
      const originalQuantity = mockProducts[0].quantity;

      component['updateQuantity'](product);

      expect(productService.updateProductQuantity).toHaveBeenCalled();
      expect(component['tableDataSource']()[0].newQuantity).toBe(originalQuantity);
    });
  });

  describe('Add Product Dialog', () => {
    beforeEach(() => {
      authService.getLoggedUserInfo.and.returnValue(mockRegularUser);
      categoryService.getCategories.and.returnValue(of(mockCategories));
      productService.getProducts.and.returnValue(of(mockProducts));

      fixture = TestBed.createComponent(ProductsComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should add new product to list when dialog returns product', (done) => {
      const newProduct: Product = {
        id: 'prod4',
        name: 'New Product',
        quantity: 5,
        categoryId: 'cat1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        newQuantity: 5
      };

      productService.addProduct.and.returnValue(of(newProduct));
      (dialog.open as jasmine.Spy).and.returnValue({ afterClosed: () => of(newProduct) } as any);

      const initialLength = component['allProducts'].length;

      component['openAddProductPopup']();

      (dialog.open as jasmine.Spy).calls.mostRecent().returnValue.afterClosed().subscribe(() => {
        expect(component['allProducts'].length).toBe(initialLength + 1);
        expect(component['allProducts']).toContain(newProduct);
        done();
      });
    });

    it('should not add product when dialog is cancelled', (done) => {
      const initialLength = component['allProducts'].length;
      (dialog.open as jasmine.Spy).and.returnValue({ afterClosed: () => of(undefined) } as any);

      component['openAddProductPopup']();

      (dialog.open as jasmine.Spy).calls.mostRecent().returnValue.afterClosed().subscribe(() => {
        expect(productService.addProduct).not.toHaveBeenCalled();
        expect(component['allProducts'].length).toBe(initialLength);
        done();
      });
    });
  });

  describe('Delete Product', () => {
    beforeEach(() => {
      authService.getLoggedUserInfo.and.returnValue(mockAdminUser);
      categoryService.getCategories.and.returnValue(of(mockCategories));
      productService.getProducts.and.returnValue(of(mockProducts));

      fixture = TestBed.createComponent(ProductsComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should open delete confirmation dialog', (done) => {
      (dialog.open as jasmine.Spy).and.returnValue({ afterClosed: () => of(false) } as any);

      component['selectOption'](mockProducts[0], 'Delete');

      expect(dialog.open).toHaveBeenCalled();

      (dialog.open as jasmine.Spy).calls.mostRecent().returnValue.afterClosed().subscribe(() => {
        done();
      });
    });

    it('should delete product when confirmed', (done) => {
      productService.deleteProduct.and.returnValue(of({}));
      (dialog.open as jasmine.Spy).and.returnValue({ afterClosed: () => of(true) } as any);
      const initialLength = component['allProducts'].length;

      component['selectOption'](mockProducts[0], 'Delete');

      (dialog.open as jasmine.Spy).calls.mostRecent().returnValue.afterClosed().subscribe(() => {
        expect(productService.deleteProduct).toHaveBeenCalledWith('prod1');
        expect(component['allProducts'].length).toBe(initialLength - 1);
        expect(component['allProducts'].find(p => p.id === 'prod1')).toBeUndefined();
        done();
      });
    });

    it('should not delete product when cancelled', (done) => {
      (dialog.open as jasmine.Spy).and.returnValue({ afterClosed: () => of(false) } as any);
      const initialLength = component['allProducts'].length;

      component['selectOption'](mockProducts[0], 'Delete');

      (dialog.open as jasmine.Spy).calls.mostRecent().returnValue.afterClosed().subscribe(() => {
        expect(productService.deleteProduct).not.toHaveBeenCalled();
        expect(component['allProducts'].length).toBe(initialLength);
        done();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle category loading error', () => {
      authService.getLoggedUserInfo.and.returnValue(mockRegularUser);
      categoryService.getCategories.and.returnValue(throwError(() => new Error('Load failed')));
      
      fixture = TestBed.createComponent(ProductsComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      
      expect(loaderService.setLoading).toHaveBeenCalledWith(false);
    });

    it('should handle product loading error', () => {
      authService.getLoggedUserInfo.and.returnValue(mockRegularUser);
      categoryService.getCategories.and.returnValue(of(mockCategories));
      productService.getProducts.and.returnValue(throwError(() => new Error('Load failed')));
      
      fixture = TestBed.createComponent(ProductsComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      
      expect(loaderService.setLoading).toHaveBeenCalledWith(false);
    });
  });
});
