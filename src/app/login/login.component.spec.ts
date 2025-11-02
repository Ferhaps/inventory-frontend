import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoggedUserInfo } from '../shared/types';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { TOKEN_KEY } from '../shared/utils';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  const mockUserInfo: LoggedUserInfo = {
    token: 'mock-token-123',
    user: {
      id: 'user-1',
      email: 'test@example.com',
      role: 'ADMIN'
    }
  };

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['login', 'getLoggedUserInfo']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);

    await TestBed.configureTestingModule({
      imports: [
        LoginComponent,
        NoopAnimationsModule,
        FormsModule
      ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  describe('Component Initialization', () => {
    it('should create the component', () => {
      authService.getLoggedUserInfo.and.returnValue(null as any);

      fixture = TestBed.createComponent(LoginComponent);
      component = fixture.componentInstance;

      expect(component).toBeTruthy();
    });

    it('should redirect to products if user is already logged in', () => {
      authService.getLoggedUserInfo.and.returnValue(mockUserInfo);

      fixture = TestBed.createComponent(LoginComponent);
      component = fixture.componentInstance;

      expect(router.navigateByUrl).toHaveBeenCalledWith('products');
    });

    it('should not redirect if user is not logged in', () => {
      authService.getLoggedUserInfo.and.returnValue(null as any);

      fixture = TestBed.createComponent(LoginComponent);
      component = fixture.componentInstance;

      expect(router.navigateByUrl).not.toHaveBeenCalled();
    });

    it('should initialize loginModel with empty email and password', () => {
      authService.getLoggedUserInfo.and.returnValue(null as any);

      fixture = TestBed.createComponent(LoginComponent);
      component = fixture.componentInstance;

      expect(component['loginModel'].email).toBe('');
      expect(component['loginModel'].password).toBe('');
    });
  });

  describe('Password Visibility Toggle', () => {
    beforeEach(() => {
      authService.getLoggedUserInfo.and.returnValue(null as any);
      fixture = TestBed.createComponent(LoginComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should toggle password visibility', () => {
      const event = new MouseEvent('click');
      spyOn(event, 'preventDefault');

      const initialState = component['hidePass']();
      component['onPassEyeClick'](event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(component['hidePass']()).toBe(!initialState);
    });
  });

  describe('Login Submission', () => {
    beforeEach(() => {
      authService.getLoggedUserInfo.and.returnValue(null as any);
      fixture = TestBed.createComponent(LoginComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should not submit if form is invalid', () => {
      const mockForm: any = { valid: false };

      component['onLoginSubmit'](mockForm);

      expect(authService.login).not.toHaveBeenCalled();
      expect(component['isLoading']()).toBe(false);
    });

    it('should call authService.login with correct credentials', fakeAsync(() => {
      const mockForm: any = { valid: true };
      const credentials = { email: 'test@example.com', password: 'Password123!' };
      component['loginModel'] = credentials;
      authService.login.and.returnValue(of(mockUserInfo));

      component['onLoginSubmit'](mockForm);
      tick();

      expect(authService.login).toHaveBeenCalledWith(credentials);
    }));

    it('should save token to localStorage on successful login', fakeAsync(() => {
      const mockForm: any = { valid: true };
      component['loginModel'] = { email: 'test@example.com', password: 'Password123!' };
      authService.login.and.returnValue(of(mockUserInfo));
      spyOn(localStorage, 'setItem');

      component['onLoginSubmit'](mockForm);
      tick();

      expect(localStorage.setItem).toHaveBeenCalledWith(TOKEN_KEY, JSON.stringify(mockUserInfo));
    }));

    it('should navigate to products on successful login', fakeAsync(() => {
      const mockForm: any = { valid: true };
      component['loginModel'] = { email: 'test@example.com', password: 'Password123!' };
      authService.login.and.returnValue(of(mockUserInfo));

      component['onLoginSubmit'](mockForm);
      tick();

      expect(router.navigateByUrl).toHaveBeenCalledWith('products');
    }));

    it('should set isLoading to false if login returns no token', fakeAsync(() => {
      const mockForm: any = { valid: true };
      const invalidUserInfo: LoggedUserInfo = { token: '', user: mockUserInfo.user };
      component['loginModel'] = { email: 'test@example.com', password: 'Password123!' };
      authService.login.and.returnValue(of(invalidUserInfo));

      component['onLoginSubmit'](mockForm);
      tick();

      expect(component['isLoading']()).toBe(false);
      expect(router.navigateByUrl).not.toHaveBeenCalled();
    }));

    it('should not save to localStorage on login error', fakeAsync(() => {
      const mockForm: any = { valid: true };
      component['loginModel'] = { email: 'test@example.com', password: 'WrongPassword!' };
      authService.login.and.returnValue(throwError(() => new Error('Login failed')));
      spyOn(localStorage, 'setItem');

      component['onLoginSubmit'](mockForm);
      tick();

      expect(localStorage.setItem).not.toHaveBeenCalled();
    }));
  });

  describe('Form Integration', () => {
    beforeEach(() => {
      authService.getLoggedUserInfo.and.returnValue(null as any);
      fixture = TestBed.createComponent(LoginComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should bind email input to loginModel', async () => {
      component['loginModel'].email = 'newtest@example.com';
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const emailInput = compiled.querySelector('input[name="email"]');

      expect(emailInput.value).toBe('newtest@example.com');
    });

    it('should bind password input to loginModel', async () => {
      component['loginModel'].password = 'NewPassword123!';
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const passwordInput = compiled.querySelector('input[name="password"]');

      expect(passwordInput.value).toBe('NewPassword123!');
    });

    it('should display spinner when loading', () => {
      component['isLoading'].set(true);
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const spinner = compiled.querySelector('mat-spinner');

      expect(spinner).toBeTruthy();
    });

    it('should enable submit button when not loading', () => {
      component['isLoading'].set(false);
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const button = compiled.querySelector('button.main-btn');

      expect(button.disabled).toBe(false);
    });
  });
});
