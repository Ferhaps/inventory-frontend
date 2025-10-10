import { ComponentFixture, TestBed } from "@angular/core/testing";
import { CategoriesComponent } from "./categories.component";
import { MatDialog } from "@angular/material/dialog";
import { CategoryService } from "./data-access/category.service";
import { AuthService } from "../../services/auth.service";
import { LoaderService } from "@ferhaps/easy-ui-lib";
import { Category, LoggedUserInfo } from "../../shared/types";
import { of } from "rxjs";

describe('CategoriesComponent', () => {
  let component: CategoriesComponent;
  let fixture: ComponentFixture<CategoriesComponent>;
  let categoryService: jasmine.SpyObj<CategoryService>;
  let authService: jasmine.SpyObj<AuthService>;
  let loaderService: jasmine.SpyObj<LoaderService>;
  let dialog: MatDialog;

  const mockCategories: (Category & { actions: string[] })[] = [
    { id: 'cat1', name: 'Category 1', actions: ['Delete'] },
    { id: 'cat2', name: 'Category 2', actions: ['Delete'] }
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
    const categoryServiceSpy = jasmine.createSpyObj('CategoryService', [
      'getCategories',
      'addCategories',
      'deletetCategory'
    ]);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getLoggedUserInfo']);
    const loaderServiceSpy = jasmine.createSpyObj('LoaderService', ['setLoading']);
    
    await TestBed.configureTestingModule({
      imports: [
        CategoriesComponent
      ],
      providers: [
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

    categoryService = TestBed.inject(CategoryService) as jasmine.SpyObj<CategoryService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    loaderService = TestBed.inject(LoaderService) as jasmine.SpyObj<LoaderService>;
    authService.getLoggedUserInfo.and.returnValue(mockRegularUser);
    dialog = TestBed.inject(MatDialog);
  });

  describe('Component Initialization', () => {
    it('should create the component', () => {
      categoryService.getCategories.and.returnValue(of([]));
      
      fixture = TestBed.createComponent(CategoriesComponent);
      component = fixture.componentInstance;
      
      expect(component).toBeTruthy();
    });

    it('should add actions column for ADMIN users', () => {
      authService.getLoggedUserInfo.and.returnValue(mockAdminUser);
      categoryService.getCategories.and.returnValue(of(mockCategories));
      
      fixture = TestBed.createComponent(CategoriesComponent);
      component = fixture.componentInstance;
      
      expect(component['displayedColumns']).toContain('actions');
    });

    it('should not add actions column for non-ADMIN users', () => {
      categoryService.getCategories.and.returnValue(of(mockCategories));
      
      fixture = TestBed.createComponent(CategoriesComponent);
      component = fixture.componentInstance;

      expect(component['displayedColumns']).not.toContain('actions');
    });

    it('should load categories on init', () => {
      categoryService.getCategories.and.returnValue(of(mockCategories));
      
      fixture = TestBed.createComponent(CategoriesComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      
      expect(categoryService.getCategories).toHaveBeenCalled();
      expect(component['categories']()).toEqual(mockCategories);
    });

    it('should set loading state correctly', () => {
      categoryService.getCategories.and.returnValue(of(mockCategories));
      
      fixture = TestBed.createComponent(CategoriesComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      
      expect(loaderService.setLoading).toHaveBeenCalledWith(true);
      expect(loaderService.setLoading).toHaveBeenCalledWith(false);
    });
  });
});