import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { Device } from '../../core/services/api.service';

@Component({
  selector: 'app-device-edit-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule],
  template: `
    <div class="p-6 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl transition-colors min-w-[320px] max-w-2xl max-h-[85vh] overflow-y-auto w-full">
      <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">Edit Device</h2>
      
      <div class="space-y-4 mb-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Device Name</label>
                <input [(ngModel)]="editData.name" type="text" class="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors" placeholder="e.g. Gateway 1" />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Status Override (Debug)</label>
                <select [(ngModel)]="editData.status" class="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors">
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                </select>
              </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Firmware Version</label>
                <input [(ngModel)]="editData.firmware" type="text" class="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors" placeholder="e.g. v1.2.0" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Hardware Version</label>
                <input [(ngModel)]="editData.hardware" type="text" class="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors" placeholder="e.g. Rev B" />
              </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Description</label>
            <textarea [(ngModel)]="editData.description" rows="2" class="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors" placeholder="Brief details about this installation"></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Location Address</label>
            <input [(ngModel)]="editData.address" type="text" class="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors" placeholder="e.g. 123 Main St" />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Latitude</label>
                <input [(ngModel)]="editData.latitude" type="number" step="0.000001" class="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors" placeholder="e.g. 40.7128" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Longitude</label>
                <input [(ngModel)]="editData.longitude" type="number" step="0.000001" class="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors" placeholder="e.g. -74.0060" />
              </div>
          </div>
      </div>

      <div class="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-zinc-800">
        <button (click)="cancel()" class="px-4 py-2 rounded-lg text-gray-600 dark:text-zinc-400 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors font-medium">Cancel</button>
        <button (click)="save()" class="px-4 py-2 rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 transition-colors font-medium">Save Changes</button>
      </div>
    </div>
  `
})
export class DeviceEditDialogComponent {
  editData: Partial<Device>;

  constructor(
    public dialogRef: MatDialogRef<DeviceEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Device
  ) {
    this.editData = { ...data };
  }

  cancel(): void {
    this.dialogRef.close();
  }

  save(): void {
    this.dialogRef.close(this.editData);
  }
}
