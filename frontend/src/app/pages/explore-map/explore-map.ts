<<<<<<< HEAD
import { Component, OnInit, AfterViewInit, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { LucideAngularModule, Filter, Coffee, Home } from 'lucide-angular';
import { VendorService, Vendor } from '../../services/vendor';
import * as L from 'leaflet';
=======
import { Component, inject, OnInit, AfterViewInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Filter, Coffee, Home, Utensils, Landmark, Navigation } from 'lucide-angular';
import * as L from 'leaflet';
import { VendorService, Vendor } from '../../services/vendor';
import { Router } from '@angular/router';
>>>>>>> 3411dac (Feat: Implement Leaflet interactive maps, GeoJSON migration, and TypeScript fixes for submission form and explore map)

@Component({
  selector: 'app-explore-map',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './explore-map.html',
  styleUrl: './explore-map.css',
})
<<<<<<< HEAD
export class ExploreMap implements OnInit, AfterViewInit {
  private platformId = inject(PLATFORM_ID);
  private vendorService = inject(VendorService);
=======
export class ExploreMap implements OnInit, AfterViewInit, OnDestroy {
  private vendorService = inject(VendorService);
  private router = inject(Router);
>>>>>>> 3411dac (Feat: Implement Leaflet interactive maps, GeoJSON migration, and TypeScript fixes for submission form and explore map)
  
  readonly filter = Filter;
  
  private map?: L.Map;
  private markersLayer = L.layerGroup();
  private readonly defaultCoords: [number, number] = [15.1449, 120.5887]; // Angeles City
  
  selectedCategory = signal<'All' | 'Local Eatery' | 'Heritage Site'>('All');
  isFilterOpen = signal(false);
  
  ngOnInit() {}

<<<<<<< HEAD
  private map?: L.Map;
  vendors: Partial<Vendor>[] = [];

  ngOnInit(): void {
    this.vendorService.getAllForMap().subscribe({
      next: (data) => {
        this.vendors = data;
        this.addMarkers();
      },
      error: (err) => {
        console.error('Failed to fetch map data:', err);
        // Map will still initialize in AfterViewInit
      }
    });
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initMap();
    }
  }

  private initMap(): void {
    // Centered on Angeles City, Pampanga
    this.map = L.map('map', {
      center: [15.145, 120.588],
      zoom: 14,
      scrollWheelZoom: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(this.map);

    this.addMarkers();
  }

  private addMarkers(): void {
    if (!this.map || this.vendors.length === 0) return;

    this.vendors.forEach(vendor => {
      if (vendor.location?.coordinates) {
        const { lat, lng } = vendor.location.coordinates;
        
        const color = vendor.category === 'Heritage Site' ? '#003366' : '#cc0000'; // Angeles Blue vs Red
        
        const iconSvg = vendor.category === 'Heritage Site' 
          ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 16px; height: 16px;"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`
          : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 16px; height: 16px;"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></svg>`;

        const customIcon = L.divIcon({
          className: 'custom-div-icon',
          html: `
            <div style="
              background-color: ${color};
              width: 32px;
              height: 32px;
              border-radius: 50%;
              border: 2px solid white;
              box-shadow: 0 4px 6px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
            ">
              ${iconSvg}
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        const marker = L.marker([lat, lng], { icon: customIcon }).addTo(this.map!);
        marker.bindPopup(`
          <div style="font-family: inherit; padding: 5px;">
            <strong style="display: block; font-size: 16px; margin-bottom: 4px;">${vendor.name}</strong>
            <span style="color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">${vendor.category}</span>
          </div>
        `);
      }
=======
  ngAfterViewInit() {
    this.initMap();
    this.loadMarkers();
    // Multiple attempts to fix tile rendering issues
    [100, 500, 1000, 2000].forEach(delay => {
      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize();
          console.log(`Audit: Map invalidated at ${delay}ms`);
        }
      }, delay);
    });
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }

  private initMap() {
    this.map = L.map('map', {
      center: this.defaultCoords,
      zoom: 14,
      zoomControl: false // We can add it back in a custom position
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
    
    this.markersLayer.addTo(this.map);
    L.control.zoom({ position: 'bottomright' }).addTo(this.map);

    // Fix default marker icon issue
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
  }

  setFilter(category: 'All' | 'Local Eatery' | 'Heritage Site') {
    this.selectedCategory.set(category);
    this.loadMarkers();
    this.isFilterOpen.set(false);
  }

  private performReverseGeocoding(lat: number, lng: number) {
    // Optional: could show address in a tooltip or status bar
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
    this.vendorService.getAllForMap().subscribe(vendors => {
      vendors.forEach(vendor => {
        if (vendor.location?.coordinates) {
          // Check filter
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
            lat = (coords as any).lat;
            lng = (coords as any).lng;
          }

          if (lat === undefined || lng === undefined) return;

          // Color logic based on verification and category
          let color = '#004A99'; // Blue (Eatery)
          if (vendor.category === 'Heritage Site') {
            color = '#C8102E'; // Red (Heritage)
          }
          if (vendor.isAuthentic) {
            color = '#FCD116'; // Yellow (Verified Authentic)
          }
          
          const icon = L.divIcon({
            className: 'custom-div-icon',
            html: `
              <div class="relative group">
                <div class="w-10 h-10 rounded-full border-4 border-white shadow-xl flex items-center justify-center transition-transform hover:-translate-y-1 hover:scale-110" 
                     style="background-color: ${color}">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${color === '#FCD116' ? '#856404' : 'white'}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    ${vendor.category === 'Heritage Site' 
                      ? '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>' 
                      : '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>'}
                  </svg>
                </div>
                <div class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-white"></div>
              </div>
            `,
            iconSize: [40, 48],
            iconAnchor: [20, 48]
          });

          const marker = L.marker([lat, lng], { icon }).addTo(this.markersLayer);
          
          const imageUrl = vendor.images && vendor.images.length > 0 ? vendor.images[0] : 'assets/placeholder-vendor.jpg';
          
          marker.bindPopup(`
            <div class="p-2 w-[220px] cursor-pointer" onclick="window.location.href='/vendor-detail/${vendor._id}'">
                <div class="w-full h-24 rounded-xl mb-2 overflow-hidden bg-gray-100">
                    <img src="${imageUrl}" class="w-full h-full object-cover" onerror="this.src='https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80'" />
                </div>
                <h3 class="font-bold text-gray-900 m-0 leading-tight">${vendor.name}</h3>
                <p class="text-[10px] text-gray-500 font-bold uppercase mt-1 m-0 flex items-center gap-1">
                    <span class="w-2 h-2 rounded-full" style="background-color: ${color}"></span>
                    ${vendor.category} ${vendor.isVerified ? '• Verified' : ''}
                </p>
                <div class="mt-3 text-angeles-blue font-bold text-xs flex items-center gap-1">
                    View Details 
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </div>
            </div>
          `, {
            className: 'custom-popup',
            maxWidth: 250
          });
        }
      });
>>>>>>> 3411dac (Feat: Implement Leaflet interactive maps, GeoJSON migration, and TypeScript fixes for submission form and explore map)
    });
  }
}
