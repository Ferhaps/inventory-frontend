import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TOKEN_KEY } from '../shared/utils';
import { catchError, Observable, of, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (): Observable<boolean> | boolean => {
  const router = inject(Router);
  const authService = inject(AuthService);

  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    return true;
    // return authService.extendToken(token).pipe(
    //   catchError(() => {
    //     localStorage.removeItem(TOKEN_KEY);
    //     router.navigateByUrl("login");
    //     return throwError(false);
    //   }),
    //   switchMap((token: string) => {
    //     if (token) {
    //       localStorage.setItem(TOKEN_KEY, token);
    //       return of(true);
    //     }

    //     return of(false);
    //   })
    // )
  } else {
    window.alert("You must be logged in to view this page!");
    router.navigateByUrl("login");
    return false;
  }
};
