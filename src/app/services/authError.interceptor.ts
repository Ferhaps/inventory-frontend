import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { EMPTY, catchError } from 'rxjs';
import { AuthService } from './auth.service';

export const authErrorInterceptor: HttpInterceptorFn = (req, next) => {
	const authService = inject(AuthService);

	return next(req).pipe(
		catchError((error: HttpErrorResponse) => {
			const isExpiredSession =
				error.status === 401 && Boolean(authService.getLoggedUserInfo()?.token);

			if (!isExpiredSession) {
				throw error;
			}

			authService.logout();
			return EMPTY;
		}),
	);
};
