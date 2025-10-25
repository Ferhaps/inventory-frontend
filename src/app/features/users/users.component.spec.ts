import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MatDialog } from "@angular/material/dialog";
import { AuthService } from "../../services/auth.service";
import { LoaderService } from "@ferhaps/easy-ui-lib";
import { LoggedUserInfo, TableDataSource, User } from "../../shared/types";
import { of } from "rxjs";
import { UsersComponent } from "./users.component";
import { UserService } from "./data-access/user.service";

describe('UsersComponent', () => {
  let component: UsersComponent;
  let fixture: ComponentFixture<UsersComponent>;
  let userService: jasmine.SpyObj<UserService>;
  let authService: jasmine.SpyObj<AuthService>;
  let loaderService: jasmine.SpyObj<LoaderService>;
  let dialog: MatDialog;

  const mockUsers: TableDataSource<User>[] = [
    { id: 'user1', email: 'user1@test.com', role: 'ADMIN', actions: ['Delete'] },
    { id: 'user2', email: 'user2@test.com', role: 'OPERATOR', actions: ['Delete'] }
  ];

  const mockAdminUser: LoggedUserInfo = {
    token: 'mock-token',
    user: { id: 'admin-user', email: 'admin@test.com', role: 'ADMIN' }
  };

  const mockRegularUser: LoggedUserInfo = {
    token: 'mock-token',
    user: { id: 'regular-user', email: 'user@test.com', role: 'OPERATOR' }
  };

  beforeEach(async () => {
    const userServiceSpy = jasmine.createSpyObj('UserService', [
      'getUsers',
      'deleteUser'
    ]);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getLoggedUserInfo']);
    const loaderServiceSpy = jasmine.createSpyObj('LoaderService', ['setLoading']);
    
    await TestBed.configureTestingModule({
      imports: [
        UsersComponent
      ],
      providers: [
        { provide: UserService, useValue: userServiceSpy },
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

    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    loaderService = TestBed.inject(LoaderService) as jasmine.SpyObj<LoaderService>;
    authService.getLoggedUserInfo.and.returnValue(mockRegularUser);
    dialog = TestBed.inject(MatDialog);
  });

  describe('Component Initialization', () => {
    it('should create the component', () => {
      userService.getUsers.and.returnValue(of([]));
      
      fixture = TestBed.createComponent(UsersComponent);
      component = fixture.componentInstance;
      
      expect(component).toBeTruthy();
    });

    it('should add actions column for ADMIN users', () => {
      authService.getLoggedUserInfo.and.returnValue(mockAdminUser);
      userService.getUsers.and.returnValue(of(mockUsers));

      fixture = TestBed.createComponent(UsersComponent);
      component = fixture.componentInstance;
      
      expect(component['displayedColumns']).toContain('actions');
    });

    it('should not add actions column for non-ADMIN users', () => {
      userService.getUsers.and.returnValue(of(mockUsers));

      fixture = TestBed.createComponent(UsersComponent);
      component = fixture.componentInstance;

      expect(component['displayedColumns']).not.toContain('actions');
    });

    it('should load users on init', () => {
      authService.getLoggedUserInfo.and.returnValue(mockAdminUser);
      userService.getUsers.and.returnValue(of(mockUsers));

      fixture = TestBed.createComponent(UsersComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(userService.getUsers).toHaveBeenCalled();
      expect(component['users']()).toEqual(mockUsers);
    });

    it('should set loading state correctly', () => {
      userService.getUsers.and.returnValue(of(mockUsers));

      fixture = TestBed.createComponent(UsersComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      
      expect(loaderService.setLoading).toHaveBeenCalledWith(true);
      expect(loaderService.setLoading).toHaveBeenCalledWith(false);
    });
  });
  
  describe('Delete User', () => {
    beforeEach(() => {
      userService.getUsers.and.returnValue(of(mockUsers));
      fixture = TestBed.createComponent(UsersComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should open delete confirmation dialog', (done) => {
      (dialog.open as jasmine.Spy).and.returnValue({ afterClosed: () => of(false) } as any);

      component['selectOption'](mockUsers[0], 'Delete');
      expect(dialog.open).toHaveBeenCalled();

      (dialog.open as jasmine.Spy).calls.mostRecent().returnValue.afterClosed().subscribe(() => {
        done();
      });
    });

    it('should delete user when confirmed', (done) => {
      userService.deleteUser.and.returnValue(of({}));
      (dialog.open as jasmine.Spy).and.returnValue({ afterClosed: () => of(true) } as any);
      const initialLength = component['users']().length;

      component['selectOption'](mockUsers[0], 'Delete');

      (dialog.open as jasmine.Spy).calls.mostRecent().returnValue.afterClosed().subscribe(() => {
        expect(userService.deleteUser).toHaveBeenCalledWith('user1');
        expect(component['users']().length).toBe(initialLength - 1);
        expect(component['users']().find(c => c.id === 'user1')).toBeUndefined();
        done();
      });
    });

    it('should not delete user when cancelled', (done) => {
      (dialog.open as jasmine.Spy).and.returnValue({ afterClosed: () => of(false) } as any);
      const initialLength = component['users']().length;

      component['selectOption'](mockUsers[0], 'Delete');

      (dialog.open as jasmine.Spy).calls.mostRecent().returnValue.afterClosed().subscribe(() => {
        expect(userService.deleteUser).not.toHaveBeenCalled();
        expect(component['users']().length).toBe(initialLength);
        done();
      });
    });
  });
});
