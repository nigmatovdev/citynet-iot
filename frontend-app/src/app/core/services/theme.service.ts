import { Injectable, signal, effect } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    isDarkMode = signal<boolean>(true);

    constructor() {
        // Load preference from local storage or default to dark
        const stored = localStorage.getItem('citynet_theme');
        if (stored) {
            this.isDarkMode.set(stored === 'dark');
        }

        // Setup effect to automatically apply the class when the signal changes
        effect(() => {
            const isDark = this.isDarkMode();
            localStorage.setItem('citynet_theme', isDark ? 'dark' : 'light');

            if (isDark) {
                document.body.classList.add('citynet-dark');
            } else {
                document.body.classList.remove('citynet-dark');
            }
        });
    }

    toggleTheme() {
        this.isDarkMode.update(dark => !dark);
    }
}
