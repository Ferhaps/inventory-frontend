import {
	ChangeDetectionStrategy,
	Component,
	inject,
	signal,
} from '@angular/core';
import {
	email,
	form,
	FormField,
	required,
	submit,
	validate,
} from '@angular/forms/signals';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { TOKEN_KEY } from '../shared/utils';
import { MatIconModule } from '@angular/material/icon';
import { LoggedUserInfo } from '../shared/types';
import { validatePasswordRules } from '@ferhaps/easy-ui-lib';
import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

const PASSWORD_RULES = {
	minLength: 8,
	requireUppercase: true,
	requireLowercase: true,
	requireDigit: true,
	requireSpecial: true,
	specialChars: '!@#$%^&*',
};

const PASSWORD_MESSAGE =
	'Requires 1 uppercase, 1 lowercase letter, 1 symbol, 1 number, 8 characters';

@Component({
	selector: 'app-login',
	imports: [
		FormField,
		MatIconModule,
		MatInputModule,
		MatButtonModule,
		MatFormFieldModule,
		MatProgressSpinnerModule,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './login.component.html',
	styleUrl: './login.component.scss',
})
export class LoginComponent {
	protected loginModel = signal({ email: '', password: '' });
	protected loginForm = form(this.loginModel, (path) => {
		required(path.email, { message: 'Invalid email' });
		email(path.email, { message: 'Invalid email' });

		required(path.password, { message: PASSWORD_MESSAGE });
		validate(path.password, ({ value }) => {
			const failed = validatePasswordRules(value(), PASSWORD_RULES);
			if (Object.keys(failed).length === 0) {
				return null;
			}
			return { kind: 'password', message: PASSWORD_MESSAGE };
		});
	});

	protected hidePass = signal(true);
	protected loginErrorMessage = signal<string | null>(null);

	private authService = inject(AuthService);
	private router = inject(Router);

	constructor() {
		const userInfo: LoggedUserInfo = this.authService.getLoggedUserInfo();
		if (userInfo?.token) {
			this.router.navigateByUrl('dashboard');
		}
	}

	protected onPassEyeClick(event: MouseEvent): void {
		event.preventDefault();
		this.hidePass.set(!this.hidePass());
	}

	protected async onLoginSubmit(): Promise<void> {
		this.loginErrorMessage.set(null);

		await submit(this.loginForm, async () => {
			try {
				const userInfo: LoggedUserInfo = await firstValueFrom(
					this.authService.login(this.loginModel()),
				);
				if (userInfo?.token) {
					localStorage.setItem(TOKEN_KEY, JSON.stringify(userInfo));
					this.router.navigateByUrl('dashboard');
				} else {
					this.loginErrorMessage.set(
						'Login failed. Please verify your credentials and try again.',
					);
				}
			} catch (e) {
				const error = e as HttpErrorResponse;
				this.loginErrorMessage.set(
					error.error?.message ||
						'Invalid email or password. Please try again.',
				);
			}
			return null;
		});
	}
}
