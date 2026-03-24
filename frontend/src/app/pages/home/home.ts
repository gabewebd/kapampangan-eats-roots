import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Search, BadgeCheck, MapPin, Star, Utensils, Landmark, ArrowRight, Loader } from 'lucide-angular';
import { VendorService, Vendor } from '../../services/vendor';
import { Router, RouterModule, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, RouterModule, RouterLink, FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  readonly search = Search;
  readonly badgeCheck = BadgeCheck;
  readonly mapPin = MapPin;
  readonly star = Star;
  readonly utensils = Utensils;
  readonly landmark = Landmark;
  readonly arrowRight = ArrowRight;
  readonly loader = Loader;

  private vendorService = inject(VendorService);
  private router = inject(Router);

  trendingSpots: Vendor[] = [];
  culturalHighlights: Vendor[] = [];
  activeCategory = 'trending';
  loading = signal(true);
  searchQuery = '';
  isSearching = false;

  ngOnInit() {
    console.log('Audit: Home component initialized');
    this.loadTrending();
    this.loadHighlights();
  }

  loadTrending() {
    this.loading.set(true);
    console.log('Audit: Fetching trending spots...');
    this.vendorService.getTrending().subscribe({
      next: (data: Vendor[]) => {
        console.log('Audit: Trending spots received', data);
        this.trendingSpots = data;
        this.loading.set(false);
      },
      error: (err: any) => {
        console.error('Audit: Trending fetch failure', err);
        this.loading.set(false);
      }
    });
  }

  loadHighlights() {
    this.vendorService.getHeritageSites().subscribe({
      next: (data: Vendor[]) => this.culturalHighlights = data,
      error: (err: any) => console.error('Audit: Highlights fetch failure', err)
    });
  }

  setCategory(category: string) {
    this.activeCategory = category;
    this.isSearching = false;
    this.searchQuery = '';
    this.loading.set(true);

    const obs$ = category === 'local-eateries'
      ? this.vendorService.getEateries()
      : category === 'heritage-sites'
        ? this.vendorService.getHeritageSites()
        : this.vendorService.getTrending();

    obs$.subscribe({
      next: (data) => {
        this.trendingSpots = data;
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  goToDetail(id: string) { this.router.navigate(['/vendor-detail', id]); }
  goToSubmit() { this.router.navigate(['/submit']); }

  performSearch() {
    if (!this.searchQuery.trim()) {
      this.setCategory(this.activeCategory);
      return;
    }

    this.loading.set(true);
    this.isSearching = true;
    this.vendorService.search(this.searchQuery).subscribe({
<<<<<<< HEAD
      next: (data) => {
        this.trendingSpots = data;
        this.loading.set(false);
      },
      error: (err) => {
=======
      next: (data: Vendor[]) => {
        this.trendingSpots = data;
        this.loading.set(false);
      },
      error: (err: any) => {
>>>>>>> 3411dac (Feat: Implement Leaflet interactive maps, GeoJSON migration, and TypeScript fixes for submission form and explore map)
        console.error('Search failure', err);
        this.loading.set(false);
      }
    });
  }
}
