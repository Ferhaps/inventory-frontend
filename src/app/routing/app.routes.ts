import { Routes } from '@angular/router';
import { authGuard } from './auth.guard';

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
    children: [
      {
        path: 'products',
        title: 'Inventory Products',
        loadComponent: () => import('../products/products.component').then((c) => c.ProductsComponent)
      },
      {
        path: 'categories',
        title: 'Inventory Categories',
        loadComponent: () => import('../categories/categories.component').then((c) => c.CategoriesComponent)
      },
      {
        path: 'users',
        title: 'Inventory Users',
        loadComponent: () => import('../users/users.component').then((c) => c.UsersComponent)
      }
    ]
  },
  { path: '**', redirectTo: 'login', pathMatch: 'full' },
];
