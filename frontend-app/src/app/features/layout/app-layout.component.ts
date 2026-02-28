import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';

// Angular Material Modules
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';

import { ThemeService } from '../../core/services/theme.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-layout',
    standalone: true,
    imports: [
        CommonModule,
        RouterOutlet,
        RouterModule,
        MatToolbarModule,
        MatButtonModule,
        MatIconModule,
        MatSidenavModule,
        MatListModule,
        MatMenuModule
    ],
    templateUrl: './app-layout.component.html',
    styleUrl: './app-layout.component.scss' // if you want component specific overrides
})
export class AppLayoutComponent {
    themeService = inject(ThemeService);
    authService = inject(AuthService);

    menuItems = [
        { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
        { label: 'Map View', icon: 'map', route: '/map' },
        { label: 'Alert Center', icon: 'notifications', route: '/alerts' },
        { label: 'Settings', icon: 'settings', route: '/settings' }
    ];

    toggleTheme() {
        this.themeService.toggleTheme();
    }

    logout() {
        this.authService.logout();
    }
}
