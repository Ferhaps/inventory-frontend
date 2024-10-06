import { Routes } from '@angular/router';
import { authGuard } from './auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('../layout/layout.component').then((c) => c.LayoutComponent),
    canActivate: [authGuard],
    // children: [
    //   {
    //     path: 'settings',
    //     canActivate: [adminGuard],
    //     loadComponent: () => import('../features/settings/settings.component').then((c) => c.SettingsComponent)
    //   }
    // ]
  },
  { path: '**', redirectTo: 'login', pathMatch: 'full' },
];
