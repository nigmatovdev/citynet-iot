import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, Device } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DeviceEditDialogComponent } from './device-edit-dialog.component';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, BaseChartDirective, MatDialogModule],
    templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
    private api = inject(ApiService);
    private auth = inject(AuthService);
    private router = inject(Router);
    private dialog = inject(MatDialog);

    devices = signal<Device[]>([]);
    isLoading = signal(true);

    // Dashboard stats
    totalDevices = signal(0);
    onlineDevices = signal(0);
    offlineDevices = signal(0);

    // Chart Configuration
    public pieChartOptions: ChartOptions<'pie'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: { color: '#a1a1aa', padding: 20, font: { family: 'system-ui' } }
            }
        }
    };

    public pieChartData = computed<ChartConfiguration<'pie'>['data']>(() => ({
        labels: ['Online Devices', 'Offline Devices'],
        datasets: [{
            data: [this.onlineDevices(), this.offlineDevices()],
            backgroundColor: ['rgba(16, 185, 129, 0.8)', 'rgba(239, 68, 68, 0.8)'],
            hoverBackgroundColor: ['rgba(16, 185, 129, 1)', 'rgba(239, 68, 68, 1)'],
            borderColor: ['#27272a', '#27272a'],
            borderWidth: 2
        }]
    }));

    ngOnInit() {
        this.loadDevices();
    }

    loadDevices() {
        this.api.getDevices().subscribe({
            next: (res) => {
                if (res.success) {
                    this.devices.set(res.data);
                    this.calculateStats();
                }
                this.isLoading.set(false);
            },
            error: (err) => {
                console.error('Error loading devices', err);
                this.isLoading.set(false);
            }
        });
    }

    calculateStats() {
        const list = this.devices();
        this.totalDevices.set(list.length);
        this.onlineDevices.set(list.filter(d => d.status === 'online').length);
        this.offlineDevices.set(list.filter(d => d.status === 'offline').length);
    }

    logout() {
        this.auth.logout();
        this.router.navigate(['/login']);
    }

    openEditDialog(device: Device) {
        const dialogRef = this.dialog.open(DeviceEditDialogComponent, {
            width: '400px',
            data: device
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                const payload: Partial<Device> = {};
                if (result.name !== device.name) payload.name = result.name;
                if (result.address !== device.address) payload.address = result.address;
                if (result.description !== device.description) payload.description = result.description;
                if (result.firmware !== device.firmware) payload.firmware = result.firmware;
                if (result.hardware !== device.hardware) payload.hardware = result.hardware;
                if (result.latitude !== device.latitude) payload.latitude = Number(result.latitude);
                if (result.longitude !== device.longitude) payload.longitude = Number(result.longitude);
                if (result.status !== device.status) payload.status = result.status;

                if (Object.keys(payload).length > 0) {
                    this.api.updateDevice(device.id, payload).subscribe({
                        next: (res) => {
                            if (res.success) {
                                // Reload table
                                this.loadDevices();
                            }
                        },
                        error: (err) => {
                            console.error('Failed to update device:', err);
                        }
                    });
                }
            }
        });
    }
}
