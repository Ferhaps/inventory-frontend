import { ComponentFixture, TestBed, fakeAsync, tick } from "@angular/core/testing";
import { MatDialog } from "@angular/material/dialog";
import { AuthService } from "../../services/auth.service";
import { LoaderService } from "@ferhaps/easy-ui-lib";
import { of, throwError } from "rxjs";
import { LogComponent } from "./log.component";
import { LogService } from "./data-access/log.service";
import { UserService } from "../users/data-access/user.service";
import { ProductService } from "../products/data-access/product.service";
import { CategoryService } from "../categories/data-access/category.service";
import { Log, LogBody, User, Product, Category } from "../../shared/types";
import { FormsModule } from "@angular/forms";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";

describe('LogComponent', () => {
  let component: LogComponent;
  let fixture: ComponentFixture<LogComponent>;
  let logService: jasmine.SpyObj<LogService>;
  let userService: jasmine.SpyObj<UserService>;
  let productService: jasmine.SpyObj<ProductService>;
  let categoryService: jasmine.SpyObj<CategoryService>;
  let authService: jasmine.SpyObj<AuthService>;
  let loaderService: jasmine.SpyObj<LoaderService>;
  let dialog: jasmine.SpyObj<MatDialog>;

  const mockLogs: Log[] = [
    {
      id: 'log1',
      timestamp: '2024-01-01T10:00:00Z',
      event: 'PRODUCT_CREATED',
      user: { id: 'user1', email: 'user1@test.com' },
      product: { id: 'product1', name: 'Test Product' },
      details: 'Product created'
    },
    {
      id: 'log2',
      timestamp: '2024-01-02T10:00:00Z',
      event: 'USER_LOGIN',
      user: { id: 'user2', email: 'user2@test.com' },
      details: 'User logged in'
    }
  ];

  const mockUsers: User[] = [
    { id: 'user1', email: 'user1@test.com', role: 'ADMIN' },
    { id: 'user2', email: 'user2@test.com', role: 'OPERATOR' }
  ];

  const mockProducts: Product[] = [
    { id: 'product1', name: 'Product 1', quantity: 10, newQuantity: 10, categoryId: 'cat1', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
    { id: 'product2', name: 'Product 2', quantity: 20, newQuantity: 20, categoryId: 'cat2', createdAt: '2024-01-01', updatedAt: '2024-01-01' }
  ];

  const mockCategories: Category[] = [
    { id: 'cat1', name: 'Category 1' },
    { id: 'cat2', name: 'Category 2' }
  ];

  const mockLogEvents: string[] = [
    'PRODUCT_CREATED',
    'PRODUCT_UPDATED',
    'USER_LOGIN',
    'USER_LOGOUT'
  ];

  beforeEach(async () => {
    const logServiceSpy = jasmine.createSpyObj('LogService', ['getLogs', 'getLogEvents']);
    const userServiceSpy = jasmine.createSpyObj('UserService', ['getUsers']);
    const productServiceSpy = jasmine.createSpyObj('ProductService', ['getProducts']);
    const categoryServiceSpy = jasmine.createSpyObj('CategoryService', ['getCategories']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getLoggedUserInfo']);
    const loaderServiceSpy = jasmine.createSpyObj('LoaderService', ['setLoading']);
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    
    await TestBed.configureTestingModule({
      imports: [
        LogComponent,
        FormsModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: LogService, useValue: logServiceSpy },
        { provide: UserService, useValue: userServiceSpy },
        { provide: ProductService, useValue: productServiceSpy },
        { provide: CategoryService, useValue: categoryServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: LoaderService, useValue: loaderServiceSpy },
        { provide: MatDialog, useValue: dialogSpy }
      ]
    }).compileComponents();

    logService = TestBed.inject(LogService) as jasmine.SpyObj<LogService>;
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    productService = TestBed.inject(ProductService) as jasmine.SpyObj<ProductService>;
    categoryService = TestBed.inject(CategoryService) as jasmine.SpyObj<CategoryService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    loaderService = TestBed.inject(LoaderService) as jasmine.SpyObj<LoaderService>;
    dialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;

    // Default mock returns
    logService.getLogs.and.returnValue(of(mockLogs));
    logService.getLogEvents.and.returnValue(of(mockLogEvents));
    userService.getUsers.and.returnValue(of(mockUsers));
    productService.getProducts.and.returnValue(of(mockProducts));
    categoryService.getCategories.and.returnValue(of(mockCategories));
  });

  describe('Component Initialization', () => {
    it('should create the component', () => {
      fixture = TestBed.createComponent(LogComponent);
      component = fixture.componentInstance;
      
      expect(component).toBeTruthy();
    });

    it('should load initial data on init', () => {
      fixture = TestBed.createComponent(LogComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(logService.getLogs).toHaveBeenCalled();
      expect(logService.getLogEvents).toHaveBeenCalled();
      expect(userService.getUsers).toHaveBeenCalled();
      expect(productService.getProducts).toHaveBeenCalled();
      expect(categoryService.getCategories).toHaveBeenCalled();
    });

    it('should populate logs array with data', () => {
      fixture = TestBed.createComponent(LogComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component['logs']?.length).toBe(2);
      expect(component['logs']).toEqual(mockLogs);
    });

    it('should populate filter options', () => {
      fixture = TestBed.createComponent(LogComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component['filteredLogEvents']).toEqual(mockLogEvents);
      expect(component['filteredUsers']).toEqual(mockUsers);
      expect(component['filteredProducts']).toEqual(mockProducts);
      expect(component['filteredCategories']).toEqual(mockCategories);
    });

    it('should set loading state correctly', () => {
      fixture = TestBed.createComponent(LogComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      
      expect(loaderService.setLoading).toHaveBeenCalledWith(true);
      expect(loaderService.setLoading).toHaveBeenCalledWith(false);
    });
  });

  describe('Date Filters', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(LogComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should filter logs by date range', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-02');
      
      component['range'] = { start: startDate, end: endDate };
      component['onDateChange']();

      expect(logService.getLogs).toHaveBeenCalledWith(jasmine.objectContaining({
        startDate,
        endDate
      }));
    });

    it('should apply quick date filter', () => {
      component['selectedDateFilter'] = 'Today';
      component['onDateFilterChange']();

      expect(logService.getLogs).toHaveBeenCalled();
      expect(component['range'].start).toBeDefined();
      expect(component['range'].end).toBeDefined();
    });

    it('should set date range when quick filter is selected', () => {
      component['selectedDateFilter'] = 'This week';
      component['onDateFilterChange']();

      expect(component['range'].start).toBeDefined();
      expect(component['range'].end).toBeDefined();
    });
  });

  describe('Event Filter', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(LogComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should filter logs by event type', () => {
      logService.getLogs.calls.reset();
      component['selectedEvent'] = 'PRODUCT_CREATED';
      component['onEventOptionClick'](null as any);

      expect(logService.getLogs).toHaveBeenCalledWith(jasmine.objectContaining({
        event: 'PRODUCT_CREATED'
      }));
    });

    it('should filter event autocomplete options', () => {
      component['searchEvent'] = 'PRODUCT';
      component['filteredLogEvents'] = component['filterAutocomplete']('events', 'PRODUCT');

      expect(component['filteredLogEvents']).toBeDefined();
      expect(component['filteredLogEvents'].length).toBeLessThanOrEqual(mockLogEvents.length);
      expect(component['filteredLogEvents'].every((e: string) => component['snakeCasePipe'].transform(e).toLowerCase().includes('product'))).toBe(true);
    });
  });

  describe('User Filter', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(LogComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should filter logs by user', () => {
      logService.getLogs.calls.reset();
      component['selectedUserId'] = 'user1';
      component['searchUser'] = 'user1@test.com';
      component['onUsersClick'](null as any);

      expect(logService.getLogs).toHaveBeenCalledWith(jasmine.objectContaining({
        user: 'user1'
      }));
    });

    it('should filter user autocomplete options', () => {
      component['searchUser'] = 'user1';
      component['filteredUsers'] = component['filterAutocomplete']('users', 'user1');

      expect(component['filteredUsers']).toBeDefined();
      expect(component['filteredUsers'].length).toBeLessThanOrEqual(mockUsers.length);
      expect(component['filteredUsers'].every((u: User) => u.email.toLowerCase().includes('user1'))).toBe(true);
    });
  });

  describe('Product Filter', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(LogComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should filter logs by product', () => {
      logService.getLogs.calls.reset();
      component['selectedProductId'] = 'product1';
      component['searchProduct'] = 'Product 1';
      component['onProductClick'](null as any);

      expect(logService.getLogs).toHaveBeenCalledWith(jasmine.objectContaining({
        product: 'product1'
      }));
    });

    it('should filter product autocomplete options', () => {
      component['searchProduct'] = 'Product 1';
      component['filteredProducts'] = component['filterAutocomplete']('products', 'Product 1');

      expect(component['filteredProducts']).toBeDefined();
      expect(component['filteredProducts'].length).toBeLessThanOrEqual(mockProducts.length);
      expect(component['filteredProducts'].every((p: Product) => p.name.toLowerCase().includes('product 1'))).toBe(true);
    });
  });

  describe('Category Filter', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(LogComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should filter logs by category', () => {
      logService.getLogs.calls.reset();
      component['selectedCategoryId'] = 'cat1';
      component['searchCategory'] = 'Category 1';
      component['onCategoryClick'](null as any);

      expect(logService.getLogs).toHaveBeenCalledWith(jasmine.objectContaining({
        category: 'cat1'
      }));
    });

    it('should filter category autocomplete options', () => {
      component['searchCategory'] = 'Category 1';
      component['filteredCategories'] = component['filterAutocomplete']('categories', 'Category 1');

      expect(component['filteredCategories']).toBeDefined();
      expect(component['filteredCategories'].length).toBeLessThanOrEqual(mockCategories.length);
      expect(component['filteredCategories'].every((c: Category) => c.name.toLowerCase().includes('category 1'))).toBe(true);
    });
  });

  describe('Clear Filters', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(LogComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should clear all filters', () => {
      component['selectedEvent'] = 'PRODUCT_CREATED';
      component['selectedUserId'] = 'user1';
      component['selectedProductId'] = 'product1';
      component['selectedCategoryId'] = 'cat1';
      component['selectedDateFilter'] = 'Today';
      component['range'] = { start: new Date(), end: new Date() };

      const mockAutoComplete = {
        options: {
          forEach: jasmine.createSpy('forEach')
        }
      } as any;

      component['clearFilters'](mockAutoComplete);

      expect(component['selectedEvent']).toBe('');
      expect(component['selectedUserId']).toBeUndefined();
      expect(component['selectedProductId']).toBeUndefined();
      expect(component['selectedCategoryId']).toBeUndefined();
      expect(component['selectedDateFilter']).toBeUndefined();
      expect(component['range'].start).toBeNull();
      expect(component['range'].end).toBeNull();
    });

    it('should reload logs after clearing filters', () => {
      component['selectedEvent'] = 'PRODUCT_CREATED';
      logService.getLogs.calls.reset();

      const mockAutoComplete = {
        options: {
          forEach: jasmine.createSpy('forEach')
        }
      } as any;

      component['clearFilters'](mockAutoComplete);

      expect(logService.getLogs.calls.count()).toBe(1);
    });
  });

  describe('Infinite Scroll', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(LogComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should load more logs on scroll', fakeAsync(() => {
      component['stopScrolling'] = false;
      logService.getLogs.calls.reset();
      logService.getLogs.and.returnValue(of([...mockLogs]));

      component['onScroll']();
      tick();

      expect(logService.getLogs.calls.count()).toBe(1);
    }));

    it('should not load more logs if already fetching', () => {
      logService.getLogs.calls.reset();
      component['isFetching'] = true;

      component['onScroll']();

      expect(logService.getLogs.calls.count()).toBe(0);
    });

    it('should set logs to new response', fakeAsync(() => {
      const newLogs: Log[] = [
        {
          id: 'log3',
          timestamp: '2024-01-03T10:00:00Z',
          event: 'CATEGORY_CREATED',
          user: { id: 'user1', email: 'user1@test.com' },
          category: { id: 'cat1', name: 'Category 1' },
          details: 'Category created'
        },
        {
          id: 'log4',
          timestamp: '2024-01-04T10:00:00Z',
          event: 'PRODUCT_UPDATED',
          user: { id: 'user2', email: 'user2@test.com' },
          product: { id: 'product2', name: 'Product 2' },
          details: 'Product updated'
        }
      ];
      
      component['stopScrolling'] = false;
      logService.getLogs.calls.reset();
      logService.getLogs.and.returnValue(of(newLogs));

      component['onScroll']();
      tick();

      expect(component['logs']).toEqual(newLogs);
    }));

    it('should increase items per page on scroll', fakeAsync(() => {
      component['stopScrolling'] = false;
      logService.getLogs.calls.reset();
      logService.getLogs.and.returnValue(of([...mockLogs]));
      const initialItemsPerPage = component['itemsPerPage'];

      component['onScroll']();
      tick();

      expect(component['itemsPerPage']).toBe(initialItemsPerPage + 50);
    }));

    it('should stop scrolling if fewer items returned than page size', () => {
      const fewLogs: Log[] = [mockLogs[0]];
      logService.getLogs.calls.reset();
      logService.getLogs.and.returnValue(of(fewLogs));

      component['onScroll']();

      expect(component['stopScrolling']).toBe(true);
    });

    it('should not load more logs if stopScrolling is true', () => {
      logService.getLogs.calls.reset();
      component['stopScrolling'] = true;

      component['onScroll']();

      expect(logService.getLogs.calls.count()).toBe(0);
    });

    it('should set isFetching to true then false after loading', fakeAsync(() => {
      let isFetchingDuringCall = false;
      component['stopScrolling'] = false;
      logService.getLogs.calls.reset();
      logService.getLogs.and.callFake(() => {
        isFetchingDuringCall = component['isFetching'];
        return of([...mockLogs]);
      });

      component['onScroll']();
      tick();
      
      expect(isFetchingDuringCall).toBe(true);
      expect(component['isFetching']).toBe(false);
    }));
  });

  describe('Action Handling', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(LogComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should handle action event', () => {
      spyOn(console, 'log');
      const action = { action: 'details', data: mockLogs[0] };

      component['onAction'](action);

      expect(console.log).toHaveBeenCalledWith('action', action);
    });
  });

  describe('Error Handling', () => {
    it('should handle errors when loading logs', () => {
      logService.getLogs.and.returnValue(throwError(() => new Error('Error loading logs')));
      logService.getLogEvents.and.returnValue(of(mockLogEvents));
      userService.getUsers.and.returnValue(of(mockUsers));
      productService.getProducts.and.returnValue(of(mockProducts));
      categoryService.getCategories.and.returnValue(of(mockCategories));

      fixture = TestBed.createComponent(LogComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(loaderService.setLoading).toHaveBeenCalledWith(false);
    });

    it('should handle errors when loading users', () => {
      logService.getLogs.and.returnValue(of(mockLogs));
      logService.getLogEvents.and.returnValue(of(mockLogEvents));
      userService.getUsers.and.returnValue(throwError(() => new Error('Error loading users')));
      productService.getProducts.and.returnValue(of(mockProducts));
      categoryService.getCategories.and.returnValue(of(mockCategories));

      fixture = TestBed.createComponent(LogComponent);
      component = fixture.componentInstance;

      expect(() => fixture.detectChanges()).not.toThrow();
    });
  });
});
