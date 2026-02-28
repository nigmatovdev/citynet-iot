import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { tap } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = `${environment.apiUrl}/auth`;

    // Using Angular 17+ Signals for state management
    currentUser = signal<any>(null);
    isAuthenticated = signal<boolean>(false);

    constructor(private http: HttpClient) {
        this.checkToken();
    }

    login(credentials: { email: string, password: string }) {
        return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
            tap(res => {
                if (res.success && res.data.token) {
                    localStorage.setItem('citynet_token', res.data.token);
                    this.currentUser.set(res.data.user);
                    this.isAuthenticated.set(true);
                }
            })
        );
    }

    logout() {
        localStorage.removeItem('citynet_token');
        this.currentUser.set(null);
        this.isAuthenticated.set(false);
    }

    getToken(): string | null {
        return localStorage.getItem('citynet_token');
    }

    private checkToken() {
        const token = this.getToken();
        if (token) {
            // In a real app we would validate the token with /me endpoint or decode it.
            // For now, assume it's valid if present
            this.isAuthenticated.set(true);
        }
    }
}
