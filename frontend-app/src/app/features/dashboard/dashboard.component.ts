import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, Device } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, BaseChartDirective],
    templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
    private api = inject(ApiService);
    private auth = inject(AuthService);
    private router = inject(Router);

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
}
