import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';

export const routes: Routes = [
  { 
    path: '', 
    component: HomeComponent,
    children: [
      { path: 'header', loadComponent: () => import('./pages/components/header/header.component').then(c => c.HeaderComponent) },
      { path: 'autocomplete', loadComponent: () => import('./pages/components/autocomplete/autocomplete.component').then(c => c.AutocompleteComponent) },
      { path: 'data-table', loadComponent: () => import('./pages/components/data-table/data-table.component').then(c => c.DataTableComponent) },
      { path: '', redirectTo: 'header', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '' }
]; 