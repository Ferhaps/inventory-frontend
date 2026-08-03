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
import { LoginComponent } from './login.component';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { LoggedUserInfo } from '../shared/types';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { TOKEN_KEY } from '../shared/utils';

describe('LoginComponent', () => {
	let component: LoginComponent;
	let fixture: ComponentFixture<LoginComponent>;
	let authService: MockedObject<AuthService>;
	let router: MockedObject<Router>;

	const mockUserInfo: LoggedUserInfo = {
		token: 'mock-token-123',
		user: {
			id: 'user-1',
			email: 'test@example.com',
			role: 'ADMIN',
			createdAt: '2024-01-01T00:00:00.000Z',
			updatedAt: '2024-01-01T00:00:00.000Z',
		},
	};

	/** NgForm stand-in — the component only reads `valid`. */
	const form = (valid: boolean): NgForm => ({ valid }) as NgForm;

	const createComponent = (): void => {
		fixture = TestBed.createComponent(LoginComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	};

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [LoginComponent, NoopAnimationsModule, FormsModule],
			providers: [
				provideZonelessChangeDetection(),
				{
					provide: AuthService,
					useValue: { login: vi.fn(), getLoggedUserInfo: vi.fn() },
				},
				{ provide: Router, useValue: { navigateByUrl: vi.fn() } },
			],
		});

		authService = TestBed.inject(AuthService) as MockedObject<AuthService>;
		router = TestBed.inject(Router) as MockedObject<Router>;

		authService.getLoggedUserInfo.mockReturnValue(
			null as unknown as LoggedUserInfo,
		);
	});

	describe('Component Initialization', () => {
		it('should create the component', () => {
			createComponent();

			expect(component).toBeTruthy();
		});

		it('should redirect to dashboard if user is already logged in', () => {
			authService.getLoggedUserInfo.mockReturnValue(mockUserInfo);

			createComponent();

			expect(router.navigateByUrl).toHaveBeenCalledWith('dashboard');
		});

		it('should not redirect if user is not logged in', () => {
			createComponent();

			expect(router.navigateByUrl).not.toHaveBeenCalled();
		});

		it('should initialize loginModel with empty email and password', () => {
			createComponent();

			expect(component['loginModel'].email).toBe('');
			expect(component['loginModel'].password).toBe('');
		});
	});

	describe('Password Visibility Toggle', () => {
		beforeEach(() => {
			createComponent();
		});

		it('should toggle password visibility', () => {
			const event = new MouseEvent('click');
			vi.spyOn(event, 'preventDefault').mockReturnValue(undefined);

			const initialState = component['hidePass']();
			component['onPassEyeClick'](event);

			expect(event.preventDefault).toHaveBeenCalled();
			expect(component['hidePass']()).toBe(!initialState);
		});
	});

	describe('Login Submission', () => {
		const credentials = {
			email: 'test@example.com',
			password: 'Password123!',
		};

		beforeEach(() => {
			createComponent();
			component['loginModel'] = { ...credentials };
		});

		it('should not submit if form is invalid', () => {
			component['onLoginSubmit'](form(false));

			expect(authService.login).not.toHaveBeenCalled();
			expect(component['isLoading']()).toBe(false);
		});

		it('should call authService.login with correct credentials', () => {
			authService.login.mockReturnValue(of(mockUserInfo));

			component['onLoginSubmit'](form(true));

			expect(authService.login).toHaveBeenCalledWith(credentials);
		});

		it('should save token to localStorage on successful login', () => {
			authService.login.mockReturnValue(of(mockUserInfo));
			const setItem = vi
				.spyOn(Storage.prototype, 'setItem')
				.mockReturnValue(undefined);

			component['onLoginSubmit'](form(true));

			expect(setItem).toHaveBeenCalledWith(
				TOKEN_KEY,
				JSON.stringify(mockUserInfo),
			);
			setItem.mockRestore();
		});

		it('should navigate to dashboard on successful login', () => {
			authService.login.mockReturnValue(of(mockUserInfo));

			component['onLoginSubmit'](form(true));

			expect(router.navigateByUrl).toHaveBeenCalledWith('dashboard');
		});

		it('should set isLoading to false if login returns no token', () => {
			authService.login.mockReturnValue(
				of({ token: '', user: mockUserInfo.user }),
			);

			component['onLoginSubmit'](form(true));

			expect(component['isLoading']()).toBe(false);
			expect(router.navigateByUrl).not.toHaveBeenCalled();
			expect(component['loginErrorMessage']()).toBeTruthy();
		});

		it('should not save to localStorage on login error', () => {
			authService.login.mockReturnValue(
				throwError(() => new Error('Login failed')),
			);
			const setItem = vi
				.spyOn(Storage.prototype, 'setItem')
				.mockReturnValue(undefined);

			component['onLoginSubmit'](form(true));

			expect(setItem).not.toHaveBeenCalled();
			expect(component['isLoading']()).toBe(false);
			setItem.mockRestore();
		});

		it('should surface the server error message when there is one', () => {
			authService.login.mockReturnValue(
				throwError(
					() =>
						new HttpErrorResponse({
							error: { message: 'Account locked' },
							status: 401,
						}),
				),
			);

			component['onLoginSubmit'](form(true));

			expect(component['loginErrorMessage']()).toBe('Account locked');
		});

		it('should fall back to a generic message when the error has none', () => {
			authService.login.mockReturnValue(
				throwError(() => new HttpErrorResponse({ status: 401 })),
			);

			component['onLoginSubmit'](form(true));

			expect(component['loginErrorMessage']()).toBe(
				'Invalid email or password. Please try again.',
			);
		});

		it('should clear a previous error message on resubmit', () => {
			authService.login.mockReturnValue(
				throwError(() => new HttpErrorResponse({ status: 401 })),
			);
			component['onLoginSubmit'](form(true));
			expect(component['loginErrorMessage']()).toBeTruthy();

			authService.login.mockReturnValue(of(mockUserInfo));
			vi.spyOn(Storage.prototype, 'setItem').mockReturnValue(undefined);
			component['onLoginSubmit'](form(true));

			expect(component['loginErrorMessage']()).toBeNull();
		});
	});

	describe('Form Integration', () => {
		beforeEach(() => {
			createComponent();
		});

		it('should bind email input to loginModel', async () => {
			component['loginModel'].email = 'newtest@example.com';
			fixture.detectChanges();
			await fixture.whenStable();
			fixture.detectChanges();

			const emailInput = fixture.nativeElement.querySelector(
				'input[name="email"]',
			) as HTMLInputElement;

			expect(emailInput.value).toBe('newtest@example.com');
		});

		it('should bind password input to loginModel', async () => {
			component['loginModel'].password = 'NewPassword123!';
			fixture.detectChanges();
			await fixture.whenStable();
			fixture.detectChanges();

			const passwordInput = fixture.nativeElement.querySelector(
				'input[name="password"]',
			) as HTMLInputElement;

			expect(passwordInput.value).toBe('NewPassword123!');
		});

		it('should display spinner when loading', () => {
			component['isLoading'].set(true);
			fixture.detectChanges();

			expect(fixture.nativeElement.querySelector('mat-spinner')).toBeTruthy();
		});

		it('should enable submit button when not loading', () => {
			component['isLoading'].set(false);
			fixture.detectChanges();

			const button = fixture.nativeElement.querySelector(
				'button.main-btn',
			) as HTMLButtonElement;

			expect(button.disabled).toBe(false);
		});
	});
});
