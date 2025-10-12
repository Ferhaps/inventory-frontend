import { ComponentFixture, TestBed } from "@angular/core/testing";
import { CategoriesComponent } from "./categories.component";
import { MatDialog } from "@angular/material/dialog";
import { CategoryService } from "./data-access/category.service";
import { AuthService } from "../../services/auth.service";
import { LoaderService } from "@ferhaps/easy-ui-lib";
import { Category, LoggedUserInfo, TableDataSource } from "../../shared/types";
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
      'addCategory',
      'deleteCategory'
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

  describe('Add Category', () => {
    beforeEach(() => {
      categoryService.getCategories.and.returnValue(of(mockCategories));
      fixture = TestBed.createComponent(CategoriesComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should add new category to list when dialog returns category', (done) => {
      const newCategory: TableDataSource<Category> = {
        id: 'cat4',
        name: 'New Category',
        actions: ['Delete']
      };

      categoryService.addCategory.and.returnValue(of(newCategory));
      (dialog.open as jasmine.Spy).and.returnValue({ afterClosed: () => of(newCategory) } as any);

      const initialLength = component['categories']().length;

      component['openAddCategoryPopup']();

      (dialog.open as jasmine.Spy).calls.mostRecent().returnValue.afterClosed().subscribe({
        next: () => {
          expect(component['categories']().length).toBe(initialLength + 1);
          expect(component['categories']()).toContain(newCategory);
          done();
        }
      });
    });

    it('should not add category when dialog is cancelled', (done) => {
      const initialLength = component['categories']().length;
      (dialog.open as jasmine.Spy).and.returnValue({ afterClosed: () => of(undefined) } as any);

      component['openAddCategoryPopup']();

      (dialog.open as jasmine.Spy).calls.mostRecent().returnValue.afterClosed().subscribe(() => {
        expect(categoryService.addCategory).not.toHaveBeenCalled();
        expect(component['categories']().length).toBe(initialLength);
        done();
      });
    });
  });

  describe('Delete Category', () => {
    beforeEach(() => {
      categoryService.getCategories.and.returnValue(of(mockCategories));
      fixture = TestBed.createComponent(CategoriesComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should open delete confirmation dialog', (done) => {
      (dialog.open as jasmine.Spy).and.returnValue({ afterClosed: () => of(false) } as any);

      component['selectOption'](mockCategories[0], 'Delete');
      expect(dialog.open).toHaveBeenCalled();

      (dialog.open as jasmine.Spy).calls.mostRecent().returnValue.afterClosed().subscribe(() => {
        done();
      });
    });

    it('should delete category when confirmed', (done) => {
      categoryService.deleteCategory.and.returnValue(of({}));
      (dialog.open as jasmine.Spy).and.returnValue({ afterClosed: () => of(true) } as any);
      const initialLength = component['categories']().length;

      component['selectOption'](mockCategories[0], 'Delete');

      (dialog.open as jasmine.Spy).calls.mostRecent().returnValue.afterClosed().subscribe(() => {
        expect(categoryService.deleteCategory).toHaveBeenCalledWith('cat1');
        expect(component['categories']().length).toBe(initialLength - 1);
        expect(component['categories']().find(c => c.id === 'cat1')).toBeUndefined();
        done();
      });
    });

    it('should not delete category when cancelled', (done) => {
      (dialog.open as jasmine.Spy).and.returnValue({ afterClosed: () => of(false) } as any);
      const initialLength = component['categories']().length;

      component['selectOption'](mockCategories[0], 'Delete');

      (dialog.open as jasmine.Spy).calls.mostRecent().returnValue.afterClosed().subscribe(() => {
        expect(categoryService.deleteCategory).not.toHaveBeenCalled();
        expect(component['categories']().length).toBe(initialLength);
        done();
      });
    });
  });
});
