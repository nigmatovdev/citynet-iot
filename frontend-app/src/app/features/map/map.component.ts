import { Component, OnInit, ElementRef, ViewChild, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as maplibregl from 'maplibre-gl';
import { ApiService, Device } from '../../core/services/api.service';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, OnDestroy {
  @ViewChild('map', { static: true }) mapElement!: ElementRef;

  private api = inject(ApiService);
  private map!: maplibregl.Map;
  private markers: maplibregl.Marker[] = [];

  // Hardcoded default fallback map bounds/center
  defaultCenter: [number, number] = [69.2401, 41.2995]; // Tashkent

  devices = signal<Device[]>([]);
  currentFilter = signal<'all' | 'online' | 'offline'>('all');

  setFilter(filter: 'all' | 'online' | 'offline') {
    this.currentFilter.set(filter);
    this.drawDeviceMarkers();
  }

  ngOnInit() {
    console.log('MapComponent initializing...');
    this.initializeMap();

    // Wait for map style to fully load before trying to fly or add markers
    this.map.on('load', () => {
      console.log('Map style successfully loaded. Attempting to find location...');

      // Sometimes map canvas sizes to 0 if container is drawn late in Angular. Force recalculation.
      setTimeout(() => this.map.resize(), 100);

      // Load devices and plot them
      this.loadDevices();
      this.findMyLocation();
    });
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }

  private initializeMap() {
    const isDark = document.documentElement.classList.contains('citynet-dark');
    const tileUrl = isDark
      ? 'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'
      : 'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png';

    this.map = new maplibregl.Map({
      container: this.mapElement.nativeElement,
      style: {
        version: 8,
        sources: {
          'raster-tiles': {
            type: 'raster',
            tiles: [tileUrl],
            tileSize: 256,
            attribution: '&copy; CartoDB'
          }
        },
        layers: [{
          id: 'simple-tiles',
          type: 'raster',
          source: 'raster-tiles',
          minzoom: 0,
          maxzoom: 22
        }]
      },
      center: this.defaultCenter,
      zoom: 11
    });

    this.map.addControl(new maplibregl.NavigationControl(), 'top-right');
  }

  private loadDevices() {
    this.api.getDevices().subscribe({
      next: (res) => {
        if (res.success) {
          this.devices.set(res.data);
          this.drawDeviceMarkers();
        }
      }
    });
  }

  private drawDeviceMarkers() {
    // Clear existing
    this.markers.forEach(m => m.remove());
    this.markers = [];

    const bounds = new maplibregl.LngLatBounds();
    let hasValidPins = false;

    this.devices().forEach(device => {
      // Apply active filter
      const filter = this.currentFilter();
      if (filter !== 'all' && device.status !== filter) {
        return; // skip this device
      }

      // Check if coordinates exist before parsing, because Number(null) or Number("") evaluates to 0
      if (device.latitude !== null && device.latitude !== undefined && device.latitude !== '' &&
        device.longitude !== null && device.longitude !== undefined && device.longitude !== '') {

        const lat = Number(device.latitude);
        const lng = Number(device.longitude);

        // Filter out strict 0,0 locations which are usually defaults for unplaced devices
        if (!isNaN(lat) && !isNaN(lng) && !(lat === 0 && lng === 0)) {
          hasValidPins = true;

          // Define marker styling based on online/offline
          const color = device.status === 'online' ? '#10b981' : '#ef4444';

          const popupDetails = `
          <div class="px-2 py-1">
            <h3 style="margin: 0; font-weight: bold; font-family: ui-sans-serif, system-ui;">${device.name || device.uid}</h3>
            <p style="margin: 4px 0 0 0; color: #6b7280; font-family: ui-sans-serif, system-ui; font-size: 13px;">${device.address || 'Unknown'}</p>
          </div>
        `;

          const popup = new maplibregl.Popup({ offset: 25, className: 'iot-popup' }).setHTML(popupDetails);
          const marker = new maplibregl.Marker({ color })
            .setLngLat([lng, lat])
            .setPopup(popup)
            .addTo(this.map);

          this.markers.push(marker);
          bounds.extend([lng, lat]);
        }
      }
    });

    if (hasValidPins) {
      // Intentionally not fitting bounds to all devices, as requested
      // this.map.fitBounds(bounds, { padding: 50, maxZoom: 15, duration: 0 });
    } else {
      // Add a fallback test device marker if the database is empty right now
      const testLat = 41.2995;
      const testLng = 69.2401;

      const popup = new maplibregl.Popup({ offset: 25, className: 'iot-popup' }).setHTML(`
        <div class="px-2 py-1">
          <h3 style="margin: 0; font-weight: bold; font-family: ui-sans-serif, system-ui;">Test Device (Tashkent)</h3>
          <p style="margin: 4px 0 0 0; color: #6b7280; font-family: ui-sans-serif, system-ui; font-size: 13px;">No API data found</p>
        </div>
      `);

      new maplibregl.Marker({ color: '#f59e0b' }) // amber color for test
        .setLngLat([testLng, testLat])
        .setPopup(popup)
        .addTo(this.map);

      // Intentionally not fitting bounds to test device either
      // this.map.fitBounds(new maplibregl.LngLatBounds([testLng, testLat], [testLng, testLat]), { padding: 50, maxZoom: 14, duration: 0 });
    }
  }

  findMyLocation() {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    // Check if we already have a geolocate control, if not we could add one, 
    // but here we just manually get the position since it's a custom button.
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: [number, number] = [position.coords.longitude, position.coords.latitude];
        this.map.flyTo({ center: coords, zoom: 14 });

        // Add a distinct blue pin for the user
        new maplibregl.Marker({ color: '#3b82f6' })
          .setLngLat(coords)
          .setPopup(new maplibregl.Popup({ offset: 25 }).setHTML('<strong>Your Location</strong>'))
          .addTo(this.map);
      },
      (error) => {
        // Provide cleaner error feedback
        let errorMessage = "Failed to locate your coordinates.";
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = "Location access was denied. Please allow location access in your browser.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMessage = "Location information is unavailable.";
        } else if (error.code === error.TIMEOUT) {
          errorMessage = "The request to get user location timed out.";
        }
        console.error("Error getting location", error);
        alert(errorMessage);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }
}
