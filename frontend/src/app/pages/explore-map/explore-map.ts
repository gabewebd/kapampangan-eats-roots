import { Component, OnInit, AfterViewInit, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { LucideAngularModule, Filter, Coffee, Home } from 'lucide-angular';
import { VendorService, Vendor } from '../../services/vendor';
import * as L from 'leaflet';

@Component({
  selector: 'app-explore-map',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './explore-map.html',
  styleUrl: './explore-map.css',
})
export class ExploreMap implements OnInit, AfterViewInit {
  private platformId = inject(PLATFORM_ID);
  private vendorService = inject(VendorService);
  
  readonly filter = Filter;
  readonly coffee = Coffee;
  readonly home = Home;

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
    });
  }
}
