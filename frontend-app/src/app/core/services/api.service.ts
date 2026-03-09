import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface Device {
    id: string;
    uid: string;
    name: string;
    status: string;
    last_seen: string;
    address?: string | null;
    description?: string | null;
    firmware?: string | null;
    hardware?: string | null;
    latitude?: string | number | null;
    longitude?: string | number | null;
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

    createDevice(payload: { uid: string, name?: string, address?: string }) {
        return this.http.post<{ success: boolean, data: Device }>(`${this.apiUrl}/devices`, payload);
    }

    updateDevice(id: string, payload: Partial<Device>) {
        return this.http.put<{ success: boolean, data: Device }>(`${this.apiUrl}/devices/${id}`, payload);
    }

    deleteDevice(id: string) {
        return this.http.delete<{ success: boolean, message: string }>(`${this.apiUrl}/devices/${id}`);
    }

    getDeviceMetrics(uid: string, limit: number = 100) {
        return this.http.get<{ success: boolean, data: { device: Device, metrics: any[] } }>(
            `${this.apiUrl}/devices/${uid}?limit=${limit}`
        );
    }
}
