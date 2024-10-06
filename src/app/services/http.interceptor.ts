import { HttpInterceptorFn } from '@angular/common/http';
import { TOKEN_KEY } from '../shared/utils';

const URLS_WITHOUT_TOKEN = [
  '/auth/login',
];

export const hTTPInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem(TOKEN_KEY);

  if (token && !URLS_WITHOUT_TOKEN.some(url => req.url.includes(url))) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(req)
    // .pipe(
    //   catchError((error: HttpErrorResponse) => {
    //     // console.log(error);
    //     errorService.sendError(error);
    //     return throwError(error);
    //   })
    // )
};
