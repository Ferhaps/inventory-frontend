import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { inject } from '@angular/core';
import { throwError } from 'rxjs';
import { ErrorService } from '@ferhaps/easy-ui-lib';

export const globalError: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const errorService = inject(ErrorService);

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
