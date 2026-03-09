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

  ngOnInit() {
    console.log('MapComponent initializing...');
    this.initializeMap();

    // Wait for map style to fully load before trying to fly or add markers
    this.map.on('load', () => {
      console.log('Map style successfully loaded. Attempting to find location...');

      // Sometimes map canvas sizes to 0 if container is drawn late in Angular. Force recalculation.
      setTimeout(() => this.map.resize(), 100);

      // For now, only show user location and do not load devices
      // this.loadDevices();
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
      // Coerce to number since JS may infer string from JSON payload 
      const lat = Number(device.latitude);
      const lng = Number(device.longitude);

      if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
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
    });

    if (hasValidPins) {
      this.map.fitBounds(bounds, { padding: 50, maxZoom: 15 });
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
