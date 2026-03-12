import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { AppLayoutComponent } from './features/layout/app-layout.component';

export const routes: Routes = [
    {
        path: 'login',
        loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent)
    },
    {
        path: '',
        component: AppLayoutComponent,
        canActivate: [authGuard],
        children: [
            {
                path: 'dashboard',
                loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
            },
            {
                path: 'profile',
                loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent),
            },
            {
                path: 'devices',
                loadComponent: () => import('./features/devices/devices.component').then(m => m.DevicesComponent),
            },
            {
                path: 'map',
                loadComponent: () => import('./features/map/map.component').then(m => m.MapComponent),
            },
            {
                path: 'analytics',
                loadComponent: () => import('./features/analytics/analytics.component').then(m => m.AnalyticsComponent),
            },
            {
                path: 'settings',
                loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent),
            },
            {
                path: '',
                redirectTo: 'dashboard',
                pathMatch: 'full'
            }
        ]
    },
    {
        path: '**',
        redirectTo: '/dashboard'
    }
];
