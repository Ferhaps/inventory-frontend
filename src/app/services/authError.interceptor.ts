import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { EMPTY, catchError } from 'rxjs';
import { LoaderService } from '@ferhaps/easy-ui-lib';
import { AuthService } from './auth.service';

export const authErrorInterceptor: HttpInterceptorFn = (req, next) => {
	const loaderService = inject(LoaderService);
	const authService = inject(AuthService);

	return next(req).pipe(
		catchError((error: HttpErrorResponse) => {
			const isExpiredSession =
				error.status === 401 && Boolean(authService.getLoggedUserInfo()?.token);

			if (!isExpiredSession) {
				throw error;
			}

			loaderService.setLoading(false);
			authService.logout();
			return EMPTY;
		}),
	);
};
