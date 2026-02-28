import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface Device {
    id: string;
    uid: string;
    name: string;
    status: string;
    last_seen: string;
    battery_voltage?: number;
    battery_capacity?: number;
}

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private apiUrl = `${environment.apiUrl}`;

    constructor(private http: HttpClient) { }

    getDevices() {
        return this.http.get<{ success: boolean, data: Device[] }>(`${this.apiUrl}/devices`);
    }

    getDeviceMetrics(uid: string, limit: number = 100) {
        return this.http.get<{ success: boolean, data: { device: Device, metrics: any[] } }>(
            `${this.apiUrl}/devices/${uid}?limit=${limit}`
        );
    }
}
