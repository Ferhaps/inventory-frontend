import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withHashLocation, withViewTransitions } from '@angular/router';
import { routes } from './routing/app.routes';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { globalError } from './services/globalError.interceptor';
import { authInterceptor } from './services/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection(),
    provideHttpClient(withInterceptors([globalError, authInterceptor]), withFetch()),
    provideRouter(routes, withComponentInputBinding(), withHashLocation(), withViewTransitions()),
  ]
};
