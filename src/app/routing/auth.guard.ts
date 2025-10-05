import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (): Observable<boolean> | boolean => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const userInfo = authService.getLoggedUserInfo();
  if (userInfo?.token) {
    return true;
  } else {
    window.alert("You must be logged in to view this page!");
    router.navigateByUrl("login");
    return false;
  }
};
