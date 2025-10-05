import { Routes } from '@angular/router';
import { authGuard } from './auth.guard';
import { provideHttpClient, withFetch, withInterceptors, withRequestsMadeViaParent } from '@angular/common/http';
import { authInterceptor } from '../services/auth.interceptor';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('../login/login.component').then((c) => c.LoginComponent),
    title: 'Inventory Login'
  },
  {
    path: '',
    loadComponent: () => import('../layout/layout.component').then((c) => c.LayoutComponent),
    canActivate: [authGuard],
    // providers: [
    //   provideHttpClient(
    //     withFetch(),
    //     withInterceptors([authInterceptor]),
    //     withRequestsMadeViaParent(),
    //   )
    // ],
    children: [
      {
        path: 'products',
        title: 'Inventory Products',
        loadComponent: () => import('../features/products/products.component').then((c) => c.ProductsComponent)
      },
      {
        path: 'categories',
        title: 'Inventory Categories',
        loadComponent: () => import('../features/categories/categories.component').then((c) => c.CategoriesComponent)
      },
      {
        path: 'users',
        title: 'Inventory Users',
        loadComponent: () => import('../features/users/users.component').then((c) => c.UsersComponent)
      },
      {
        path: 'log',
        title: 'Inventory Log',
        loadComponent: () => import('../features/log/log.component').then((c) => c.LogComponent)
      }
    ]
  },
  { path: '**', redirectTo: 'login', pathMatch: 'full' },
];
