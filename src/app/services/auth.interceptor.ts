import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { LoggedUserInfo } from '../shared/types';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  const userInfo: LoggedUserInfo = authService.getLoggedUserInfo();
  if (userInfo?.token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${userInfo.token}` }
    });
  }

  return next(req);
};
