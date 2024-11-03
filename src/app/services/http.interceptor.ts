import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { TOKEN_KEY } from '../shared/utils';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { inject } from '@angular/core';
import { throwError } from 'rxjs';
import { ErrorService } from '../../../projects/ui-lib/src/public-api';
import { LoggedUserInfo } from '../shared/types';

const URLS_WITHOUT_TOKEN = [
  '/auth/login'
];

export const hTTPInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const errorService = inject(ErrorService);

  const userInfo: LoggedUserInfo = JSON.parse(localStorage.getItem(TOKEN_KEY)!);
  if (userInfo?.token && !URLS_WITHOUT_TOKEN.some(url => req.url.includes(url))) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${userInfo.token}` }
    });
  }

  return next(req)
    .pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          authService.logout();
        } else {
          errorService.sendError(error);
        }
        return throwError(error);
      })
    )
};
