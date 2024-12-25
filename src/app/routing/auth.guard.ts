import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TOKEN_KEY } from '../shared/utils';
import { Observable } from 'rxjs';

export const authGuard: CanActivateFn = (): Observable<boolean> | boolean => {
  const router = inject(Router);

  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    return true;
  } else {
    window.alert("You must be logged in to view this page!");
    router.navigateByUrl("login");
    return false;
  }
};
