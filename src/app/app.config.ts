import {
	ApplicationConfig,
	provideZonelessChangeDetection,
} from '@angular/core';
import {
	provideRouter,
	withComponentInputBinding,
	withHashLocation,
	withViewTransitions,
} from '@angular/router';
import { routes } from './routing/app.routes';
import { provideEasyUiLib } from '@ferhaps/easy-ui-lib';
import { authErrorInterceptor } from './services/authError.interceptor';
import { authInterceptor } from './services/auth.interceptor';

export const appConfig: ApplicationConfig = {
	providers: [
		provideZonelessChangeDetection(),
		provideEasyUiLib([authInterceptor, authErrorInterceptor]),
		provideRouter(
			routes,
			withComponentInputBinding(),
			withHashLocation(),
			withViewTransitions(),
		),
	],
};
