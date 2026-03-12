import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { ApiService, Device } from '../../core/services/api.service';

@Component({
    selector: 'app-analytics',
    standalone: true,
    imports: [CommonModule, BaseChartDirective],
    templateUrl: './analytics.component.html'
})
export class AnalyticsComponent implements OnInit {
    private api = inject(ApiService);

    // Data State
    devices = signal<Device[]>([]);
    isLoading = signal(true);

    // Status Pie Chart
    statusChartData = computed<ChartData<'doughnut'>>(() => {
        const online = this.devices().filter(d => d.status === 'online').length;
        const offline = this.devices().filter(d => d.status === 'offline').length;
        const unknown = this.devices().length - (online + offline);

        return {
            labels: ['Online', 'Offline', 'Unknown'],
            datasets: [{
                data: [online, offline, unknown],
                backgroundColor: ['#10b981', '#ef4444', '#9ca3af'],
                borderWidth: 0
            }]
        };
    });

    statusChartOptions: any = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        plugins: {
            legend: { position: 'bottom' }
        }
    };

    // Firmware Bar Chart
    firmwareChartData = computed<ChartData<'bar'>>(() => {
        const fwCounts = new Map<string, number>();
        this.devices().forEach(d => {
            const fw = d.firmware || 'Unspecified';
            fwCounts.set(fw, (fwCounts.get(fw) || 0) + 1);
        });

        return {
            labels: Array.from(fwCounts.keys()),
            datasets: [{
                label: 'Devices',
                data: Array.from(fwCounts.values()),
                backgroundColor: '#3b82f6',
                borderRadius: 4
            }]
        };
    });

    barChartOptions: any = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false }
        },
        scales: {
            y: { beginAtZero: true, ticks: { precision: 0 } }
        }
    };

    // Hardware Doughnut Chart
    hardwareChartData = computed<ChartData<'doughnut'>>(() => {
        const hwCounts = new Map<string, number>();
        this.devices().forEach(d => {
            const hw = d.hardware || 'Unspecified';
            hwCounts.set(hw, (hwCounts.get(hw) || 0) + 1);
        });

        return {
            labels: Array.from(hwCounts.keys()),
            datasets: [{
                data: Array.from(hwCounts.values()),
                backgroundColor: ['#8b5cf6', '#ec4899', '#f59e0b', '#06b6d4', '#64748b'],
                borderWidth: 0
            }]
        };
    });

    hardwareChartOptions: any = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '50%',
        plugins: {
            legend: { position: 'right' }
        }
    };

    // Global Battery Distribution Bar Chart
    batteryChartData = computed<ChartData<'bar'>>(() => {
        // Battery levels typically 0-100. We group by 20% increments.
        const buckets = {
            '0-20%': 0,
            '21-40%': 0,
            '41-60%': 0,
            '61-80%': 0,
            '81-100%': 0,
            'Unknown': 0
        };

        this.devices().forEach(d => {
            const cap = d.battery_capacity; // 0.0 to 1.0 occasionally, or 0-100? Let's assume 0-100 for display, or missing.
            if (cap === null || cap === undefined) {
                buckets['Unknown']++;
            } else {
                // Force percentage 0-100
                const p = cap <= 1 ? cap * 100 : cap;
                if (p <= 20) buckets['0-20%']++;
                else if (p <= 40) buckets['21-40%']++;
                else if (p <= 60) buckets['41-60%']++;
                else if (p <= 80) buckets['61-80%']++;
                else buckets['81-100%']++;
            }
        });

        return {
            labels: Object.keys(buckets),
            datasets: [{
                label: 'Devices',
                data: Object.values(buckets),
                backgroundColor: '#10b981', // Emerald
                borderRadius: 4
            }]
        };
    });

    batteryChartOptions: any = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false }
        },
        scales: {
            y: { beginAtZero: true, ticks: { precision: 0 } }
        }
    };

    // Last Seen Timeline (Distribution of devices seen over time)
    timelineChartData = computed<ChartData<'line'>>(() => {
        const dataPoints: { x: number, y: number }[] = [];

        // Group by hour strictly using timestamp buckets for scattering
        const counts = new Map<number, number>();

        this.devices().forEach(d => {
            if (!d.last_seen) return;
            const t = new Date(d.last_seen).getTime();
            // Round to nearest hour
            const hour = Math.floor(t / (1000 * 60 * 60)) * (1000 * 60 * 60);
            counts.set(hour, (counts.get(hour) || 0) + 1);
        });

        Array.from(counts.entries()).sort((a, b) => a[0] - b[0]).forEach(([time, count]) => {
            dataPoints.push({ x: time, y: count });
        });

        return {
            datasets: [{
                label: 'Devices Active',
                data: dataPoints,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true,
                tension: 0.4
            }]
        };
    });

    timelineChartOptions: any = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false }
        },
        scales: {
            y: { beginAtZero: true, ticks: { precision: 0 } },
            x: {
                type: 'time',
                time: {
                    unit: 'hour'
                },
                title: { display: true, text: 'Time' }
            }
        }
    };

    metrics = signal<any[]>([]);

    // Temperature Trends over Time
    temperatureChartData = computed<ChartData<'line'>>(() => {
        const met = this.metrics();
        if (!met || met.length === 0) return { datasets: [] };

        const deviceData = new Map<string, { x: number, y: number }[]>();

        met.forEach(m => {
            if (m.temperature === null || m.temperature === undefined) return;
            if (!deviceData.has(m.uid)) deviceData.set(m.uid, []);
            deviceData.get(m.uid)!.push({
                x: new Date(m.created_at).getTime(),
                y: Number(m.temperature)
            });
        });

        const datasets = Array.from(deviceData.entries()).map(([uid, points], index) => {
            const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];
            const color = colors[index % colors.length];

            // Sort points by time
            points.sort((a, b) => a.x - b.x);

            const deviceName = met.find(m => m.uid === uid)?.name || uid;

            return {
                label: deviceName,
                data: points,
                borderColor: color,
                backgroundColor: 'transparent',
                tension: 0.4,
                spanGaps: true
            };
        });

        return { datasets };
    });

    temperatureChartOptions: any = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'bottom' },
            tooltip: { mode: 'index', intersect: false }
        },
        scales: {
            y: { title: { display: true, text: 'Temperature (°C)' } },
            x: {
                type: 'time',
                time: {
                    unit: 'hour'
                },
                title: { display: true, text: 'Time' }
            }
        }
    };

    // Humidity Trends over Time
    humidityChartData = computed<ChartData<'line'>>(() => {
        const met = this.metrics();
        if (!met || met.length === 0) return { datasets: [] };

        const deviceData = new Map<string, { x: number, y: number }[]>();

        met.forEach(m => {
            if (m.humidity === null || m.humidity === undefined) return;
            if (!deviceData.has(m.uid)) deviceData.set(m.uid, []);
            deviceData.get(m.uid)!.push({
                x: new Date(m.created_at).getTime(),
                y: Number(m.humidity)
            });
        });

        const datasets = Array.from(deviceData.entries()).map(([uid, points], index) => {
            const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'];
            const color = colors[index % colors.length];

            // Sort points by time
            points.sort((a, b) => a.x - b.x);

            const deviceName = met.find(m => m.uid === uid)?.name || uid;

            return {
                label: deviceName,
                data: points,
                borderColor: color,
                backgroundColor: 'transparent',
                tension: 0.4,
                spanGaps: true
            };
        });

        return { datasets };
    });

    humidityChartOptions: any = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'bottom' },
            tooltip: { mode: 'index', intersect: false }
        },
        scales: {
            y: { title: { display: true, text: 'Humidity (%)' } },
            x: {
                type: 'time',
                time: {
                    unit: 'hour'
                },
                title: { display: true, text: 'Time' }
            }
        }
    };


    ngOnInit() {
        this.loadData();
    }

    loadData() {
        this.isLoading.set(true);

        import('rxjs').then(({ forkJoin }) => {
            forkJoin({
                devices: this.api.getDevices(),
                metrics: this.api.getGlobalMetrics(1000)
            }).subscribe({
                next: (res) => {
                    if (res.devices.success) {
                        this.devices.set(res.devices.data);
                    }
                    if (res.metrics.success) {
                        this.metrics.set(res.metrics.data);
                    }
                    this.isLoading.set(false);
                },
                error: (err) => {
                    console.error('Failed to load data for analytics', err);
                    this.isLoading.set(false);
                }
            });
        });
    }
}
