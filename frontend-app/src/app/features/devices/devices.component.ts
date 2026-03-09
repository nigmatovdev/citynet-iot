import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Device } from '../../core/services/api.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DeviceEditDialogComponent } from '../dashboard/device-edit-dialog.component';

@Component({
  selector: 'app-devices',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule],
  templateUrl: './devices.component.html'
})
export class DevicesComponent implements OnInit {
  private api = inject(ApiService);
  private dialog = inject(MatDialog);

  devices = signal<Device[]>([]);
  isLoading = signal(true);

  // Create Form State
  showCreateForm = signal(false);
  newDevicePrefix = 'RMD-';
  newDevice = {
    uid: '',
    name: '',
    address: '',
    description: '',
    firmware: '',
    hardware: '',
    latitude: null as number | null,
    longitude: null as number | null,
    status: 'offline'
  };

  ngOnInit() {
    this.loadDevices();
  }

  loadDevices() {
    this.isLoading.set(true);
    this.api.getDevices().subscribe({
      next: (res) => {
        if (res.success) {
          this.devices.set(res.data);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading devices:', err);
        this.isLoading.set(false);
      }
    });
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

        // Coerce payload to numbers if parsing map coordinates
        if (result.latitude !== device.latitude) payload.latitude = Number(result.latitude);
        if (result.longitude !== device.longitude) payload.longitude = Number(result.longitude);

        if (result.status !== device.status) payload.status = result.status;

        if (Object.keys(payload).length > 0) {
          this.api.updateDevice(device.id, payload).subscribe({
            next: (res) => {
              if (res.success) this.loadDevices();
            }
          });
        }
      }
    });
  }

  deleteDevice(id: string) {
    if (confirm('Are you sure you want to delete this device? This action cannot be undone.')) {
      // Assuming apiService.deleteDevice exists; if not we implement it.
      (this.api as any).deleteDevice(id).subscribe({
        next: (res: any) => {
          if (res.success) this.loadDevices();
        }
      });
    }
  }

  toggleCreateForm() {
    this.showCreateForm.update(v => !v);
    this.newDevice = {
      uid: '',
      name: '',
      address: '',
      description: '',
      firmware: '',
      hardware: '',
      latitude: null,
      longitude: null,
      status: 'offline'
    };
  }

  createDevice() {
    if (!this.newDevice.uid.trim()) return;
    const fullUid = this.newDevicePrefix + this.newDevice.uid.trim();

    // Copy payload and clean up empty optional numbers
    const payload: any = { ...this.newDevice, uid: fullUid };
    if (payload.latitude === null) delete payload.latitude;
    if (payload.longitude === null) delete payload.longitude;

    // Call api to create device
    (this.api as any).createDevice(payload).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.toggleCreateForm();
          this.loadDevices();
        }
      },
      error: (err: any) => {
        alert(err.error?.error || 'Failed to create device');
      }
    });
  }
}
