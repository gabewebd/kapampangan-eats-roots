import { Component, inject, AfterViewInit, OnDestroy, signal, HostListener, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Filter, Navigation } from 'lucide-angular';
import * as L from 'leaflet';
import { VendorService, Vendor } from '../../services/vendor';
import { Router } from '@angular/router';

@Component({
  selector: 'app-explore-map',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './explore-map.html',
  styleUrl: './explore-map.css',
})
export class ExploreMap implements AfterViewInit, OnDestroy {
  private vendorService = inject(VendorService);
  private router = inject(Router);

  readonly filter = Filter;
  readonly navigationIcon = Navigation;

  private map?: L.Map;
  private markersLayer = L.layerGroup();
  private readonly defaultCoords: [number, number] = [15.1449, 120.5887]; // Angeles City
  private invalidateTimer?: any;

  // Grab the element safely via Angular's ViewChild
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;

  selectedCategory = signal<'All' | 'Local Eatery' | 'Heritage Site'>('All');
  isFilterOpen = signal(false);

  ngAfterViewInit() {
    this.initMap();
    this.loadMarkers();
  }

  ngOnDestroy() {
    if (this.invalidateTimer) {
      clearInterval(this.invalidateTimer);
    }
    if (this.map) {
      this.map.remove();
    }
  }

  @HostListener('window:resize')
  onResize() {
    if (this.map) {
      this.map.invalidateSize();
    }
  }

  private initMap() {
    // Use the native element from ViewChild instead of getElementById
    const mapEl = this.mapContainer?.nativeElement;

    if (!mapEl) {
      console.error('Audit: mapContainer element not found by ViewChild!');
      return;
    }

    // Force the element to have explicit dimensions before Leaflet initializes
    mapEl.style.width = '100%';
    mapEl.style.height = '100vh';

    this.map = L.map(mapEl, {
      center: this.defaultCoords,
      zoom: 14,
      zoomControl: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.markersLayer.addTo(this.map);
    L.control.zoom({ position: 'bottomright' }).addTo(this.map);

    // Fix default marker icon
    const DefaultIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      tooltipAnchor: [16, -28],
      shadowSize: [41, 41]
    });
    L.Marker.prototype.options.icon = DefaultIcon;

    // Give Angular 100ms to finish rendering the CSS layout, 
    // then force Leaflet to recalculate the size and fetch tiles.
    setTimeout(() => {
      if (this.map) {
        this.map.invalidateSize();
      }
    }, 100); 
  }

  setFilter(category: 'All' | 'Local Eatery' | 'Heritage Site') {
    this.selectedCategory.set(category);
    this.loadMarkers();
    this.isFilterOpen.set(false);
  }

  locateMe() {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        if (this.map) {
          this.map.setView([latitude, longitude], 16);
          setTimeout(() => this.map?.invalidateSize(), 150);
        }
      },
      () => alert('Unable to retrieve your location')
    );
  }

  private loadMarkers() {
    this.markersLayer.clearLayers();
    this.vendorService.getAllForMap().subscribe((vendors: any[]) => {
      vendors.forEach((vendor: any) => {
        if (vendor.location?.coordinates) {
          if (this.selectedCategory() !== 'All' && vendor.category !== this.selectedCategory()) {
            return;
          }

          let lat: number | undefined;
          let lng: number | undefined;
          const coords = vendor.location.coordinates;

          if (Array.isArray(coords)) {
            lng = coords[0];
            lat = coords[1];
          } else if (coords && typeof coords === 'object' && 'lat' in coords && 'lng' in coords) {
            lat = coords.lat;
            lng = coords.lng;
          }

          if (lat === undefined || lng === undefined) return;

          // Color logic: Blue (Eatery), Red (Heritage), Yellow (Verified Authentic)
          let color = '#004A99';
          if (vendor.category === 'Heritage Site') {
            color = '#C8102E';
          }
          if (vendor.isAuthentic) {
            color = '#FCD116';
          }

          const icon = L.divIcon({
            className: 'custom-div-icon',
            html: `
              <div style="position:relative">
                <div style="width:40px;height:40px;border-radius:50%;border:4px solid white;box-shadow:0 10px 15px rgba(0,0,0,0.2);display:flex;align-items:center;justify-content:center;background-color:${color}">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${color === '#FCD116' ? '#856404' : 'white'}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    ${vendor.category === 'Heritage Site'
                      ? '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>'
                      : '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>'}
                  </svg>
                </div>
                <div style="position:absolute;bottom:-6px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:8px solid white"></div>
              </div>
            `,
            iconSize: [40, 48],
            iconAnchor: [20, 48]
          });

          const marker = L.marker([lat, lng], { icon }).addTo(this.markersLayer);

          const imageUrl = vendor.images && vendor.images.length > 0 ? vendor.images[0] : 'assets/placeholder-vendor.jpg';

          marker.bindPopup(`
            <div style="padding:8px;width:220px;cursor:pointer" onclick="window.location.href='/vendor-detail/${vendor._id}'">
                <div style="width:100%;height:96px;border-radius:12px;margin-bottom:8px;overflow:hidden;background:#f3f4f6">
                    <img src="${imageUrl}" style="width:100%;height:100%;object-fit:cover" onerror="this.src='https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80'" />
                </div>
                <h3 style="font-weight:bold;color:#111;margin:0;line-height:1.2">${vendor.name}</h3>
                <p style="font-size:10px;color:#6b7280;font-weight:bold;text-transform:uppercase;margin-top:4px;margin-bottom:0;display:flex;align-items:center;gap:4px">
                    <span style="width:8px;height:8px;border-radius:50%;background-color:${color};display:inline-block"></span>
                    ${vendor.category} ${vendor.isVerified ? '• Verified' : ''}
                </p>
                <div style="margin-top:12px;color:#004A99;font-weight:bold;font-size:12px;display:flex;align-items:center;gap:4px">
                    View Details →
                </div>
            </div>
          `, {
            className: 'custom-popup',
            maxWidth: 250
          });
        }
      });
    });
  }
}
