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
import { of, Subject, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { LoggedUserInfo } from '../shared/types';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
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

	const credentials = {
		email: 'test@example.com',
		password: 'Password123!',
	};

	const createComponent = (): void => {
		fixture = TestBed.createComponent(LoginComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	};

	/** Inputs are rendered in template order: email first, password second. */
	const inputs = (): HTMLInputElement[] =>
		Array.from(fixture.nativeElement.querySelectorAll('input'));

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [LoginComponent, NoopAnimationsModule],
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

			expect(component['loginModel']()).toEqual({ email: '', password: '' });
		});
	});

	describe('Validation', () => {
		beforeEach(() => {
			createComponent();
		});

		it('should start invalid with an empty model', () => {
			expect(component['loginForm']().invalid()).toBe(true);
		});

		it('should reject a malformed email', () => {
			component['loginModel'].set({ ...credentials, email: 'not-an-email' });

			expect(component['loginForm'].email().invalid()).toBe(true);
			expect(component['loginForm'].email().errors()[0].message).toBe(
				'Invalid email',
			);
		});

		it('should reject a password that fails the strength rules', () => {
			component['loginModel'].set({ ...credentials, password: 'weak' });

			expect(component['loginForm'].password().invalid()).toBe(true);
			expect(component['loginForm'].password().errors()[0].message).toContain(
				'1 uppercase',
			);
		});

		it('should accept valid credentials', () => {
			component['loginModel'].set(credentials);

			expect(component['loginForm']().valid()).toBe(true);
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
		beforeEach(() => {
			createComponent();
			component['loginModel'].set({ ...credentials });
		});

		it('should not submit if form is invalid', async () => {
			component['loginModel'].set({ email: '', password: '' });

			await component['onLoginSubmit']();

			expect(authService.login).not.toHaveBeenCalled();
			expect(component['loginForm']().submitting()).toBe(false);
		});

		it('should call authService.login with correct credentials', async () => {
			authService.login.mockReturnValue(of(mockUserInfo));

			await component['onLoginSubmit']();

			expect(authService.login).toHaveBeenCalledWith(credentials);
		});

		it('should save token to localStorage on successful login', async () => {
			authService.login.mockReturnValue(of(mockUserInfo));
			const setItem = vi
				.spyOn(Storage.prototype, 'setItem')
				.mockReturnValue(undefined);

			await component['onLoginSubmit']();

			expect(setItem).toHaveBeenCalledWith(
				TOKEN_KEY,
				JSON.stringify(mockUserInfo),
			);
			setItem.mockRestore();
		});

		it('should navigate to dashboard on successful login', async () => {
			authService.login.mockReturnValue(of(mockUserInfo));

			await component['onLoginSubmit']();

			expect(router.navigateByUrl).toHaveBeenCalledWith('dashboard');
		});

		it('should surface an error if login returns no token', async () => {
			authService.login.mockReturnValue(
				of({ token: '', user: mockUserInfo.user }),
			);

			await component['onLoginSubmit']();

			expect(component['loginForm']().submitting()).toBe(false);
			expect(router.navigateByUrl).not.toHaveBeenCalled();
			expect(component['loginErrorMessage']()).toBeTruthy();
		});

		it('should not save to localStorage on login error', async () => {
			authService.login.mockReturnValue(
				throwError(() => new Error('Login failed')),
			);
			const setItem = vi
				.spyOn(Storage.prototype, 'setItem')
				.mockReturnValue(undefined);

			await component['onLoginSubmit']();

			expect(setItem).not.toHaveBeenCalled();
			expect(component['loginForm']().submitting()).toBe(false);
			setItem.mockRestore();
		});

		it('should surface the server error message when there is one', async () => {
			authService.login.mockReturnValue(
				throwError(
					() =>
						new HttpErrorResponse({
							error: { message: 'Account locked' },
							status: 401,
						}),
				),
			);

			await component['onLoginSubmit']();

			expect(component['loginErrorMessage']()).toBe('Account locked');
		});

		it('should fall back to a generic message when the error has none', async () => {
			authService.login.mockReturnValue(
				throwError(() => new HttpErrorResponse({ status: 401 })),
			);

			await component['onLoginSubmit']();

			expect(component['loginErrorMessage']()).toBe(
				'Invalid email or password. Please try again.',
			);
		});

		it('should clear a previous error message on resubmit', async () => {
			authService.login.mockReturnValue(
				throwError(() => new HttpErrorResponse({ status: 401 })),
			);
			await component['onLoginSubmit']();
			expect(component['loginErrorMessage']()).toBeTruthy();

			authService.login.mockReturnValue(of(mockUserInfo));
			vi.spyOn(Storage.prototype, 'setItem').mockReturnValue(undefined);
			await component['onLoginSubmit']();

			expect(component['loginErrorMessage']()).toBeNull();
		});
	});

	describe('Form Integration', () => {
		beforeEach(async () => {
			createComponent();
			await fixture.whenStable();
			fixture.detectChanges();
		});

		it('should bind email input to loginModel', async () => {
			component['loginModel'].set({ ...credentials, email: 'new@example.com' });
			fixture.detectChanges();
			await fixture.whenStable();
			fixture.detectChanges();

			expect(inputs()[0].value).toBe('new@example.com');
		});

		it('should bind password input to loginModel', async () => {
			component['loginModel'].set({
				...credentials,
				password: 'NewPassword123!',
			});
			fixture.detectChanges();
			await fixture.whenStable();
			fixture.detectChanges();

			expect(inputs()[1].value).toBe('NewPassword123!');
		});

		it('should write user input back into loginModel', async () => {
			const emailInput = inputs()[0];
			emailInput.value = 'typed@example.com';
			emailInput.dispatchEvent(new Event('input'));
			await fixture.whenStable();
			fixture.detectChanges();

			expect(component['loginModel']().email).toBe('typed@example.com');
		});

		it('should display spinner while submitting', async () => {
			const login$ = new Subject<LoggedUserInfo>();
			authService.login.mockReturnValue(login$);
			component['loginModel'].set({ ...credentials });

			const submitted = component['onLoginSubmit']();
			await fixture.whenStable();
			fixture.detectChanges();

			expect(component['loginForm']().submitting()).toBe(true);
			expect(fixture.nativeElement.querySelector('mat-spinner')).toBeTruthy();

			login$.next(mockUserInfo);
			login$.complete();
			await submitted;
		});

		it('should enable submit button when not submitting', () => {
			const button = fixture.nativeElement.querySelector(
				'button.main-btn',
			) as HTMLButtonElement;

			expect(button.disabled).toBe(false);
		});
	});
});
