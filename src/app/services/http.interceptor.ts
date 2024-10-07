import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { TOKEN_KEY } from '../shared/utils';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { inject } from '@angular/core';
import { throwError } from 'rxjs';

const URLS_WITHOUT_TOKEN = [
  '/auth/login',
];

export const hTTPInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  const token = localStorage.getItem(TOKEN_KEY);
  if (token && !URLS_WITHOUT_TOKEN.some(url => req.url.includes(url))) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(req)
    .pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          authService.logout();
        }
        return throwError(error);
      })
    )
};
