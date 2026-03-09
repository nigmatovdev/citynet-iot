import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './settings.component.html',
})
export class SettingsComponent {
  configs = [
    { property: 'Telemetry Polling Rate', value: '5 seconds', description: 'How often edge devices send data.' },
    { property: 'Offline Threshold', value: '30 seconds', description: 'Time before a device is marked as offline.' },
    { property: 'Alert Retention', value: '90 days', description: 'Data retention policy for triggered alerts.' }
  ];
}
