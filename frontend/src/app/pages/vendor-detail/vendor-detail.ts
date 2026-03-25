import { Component, OnInit, inject, signal, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { VendorService, Vendor } from '../../services/vendor';
import { LucideAngularModule, Calendar, MapPin, BadgeCheck, BookOpen, Quote, Landmark, Activity, ChevronRight, Clock, Star, Map, Loader, ArrowLeft, Share2, Heart, PenLine, Bookmark, Check, Volume2, VolumeX, X } from 'lucide-angular';
import * as L from 'leaflet';
import { AuthService } from '../../services/auth';
import { UserService } from '../../services/user.service';
import { ReviewService, Review } from '../../services/review.service';
import { timeout, catchError, of } from 'rxjs';
import { VoiceStoryService } from '../../services/voice-story.service';
import { ConnectionService } from '../../services/connection.service';

@Component({
  selector: 'app-vendor-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule,
    FormsModule
  ],
  providers: [
    LucideAngularModule.pick({ Calendar, MapPin, BadgeCheck, BookOpen, Quote, Landmark, Activity, ChevronRight, Clock, Star, Map, Loader, ArrowLeft, Share2, Heart, PenLine, Bookmark, Check, X, Volume2, VolumeX }).providers!
  ],
  templateUrl: './vendor-detail.html',
  styleUrl: './vendor-detail.css',
})
export class VendorDetail implements OnInit, AfterViewInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private vendorService = inject(VendorService);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private reviewService = inject(ReviewService);
  private router = inject(Router);
  private voiceService = inject(VoiceStoryService);
  private cdr = inject(ChangeDetectorRef);
  private connectionService = inject(ConnectionService);

  vendor: Vendor | null = null;
  relatedVendors: Vendor[] = [];
  reviews: Review[] = [];
  isFavorite = signal(false);
  isSaved = signal(false);
  isVisited = signal(false);
  showReviewModal = signal(false);
  isSubmittingReview = signal(false);

  newReview = {
    rating: 5,
    comment: ''
  };

  selectedMenuItem = signal<any>(null);
  showMenuPopup = signal(false);
  
  selectedGalleryImage = signal<string | null>(null);
  showGalleryPopup = signal(false);
  private map?: L.Map;
  private marker?: L.Marker;

  isLoading = signal(true);
  isReviewsLoading = signal(true);
  isSpeaking = this.voiceService.isSpeaking;
  error = '';

  constructor() {
    console.log('Audit [VendorDetail]: Constructor executed');
  }

  ngOnInit() {
    this.route.paramMap.subscribe({
      next: (params) => {
        const id = params.get('id');
        if (id) {
          this.loadVendor(id);
          this.loadReviews(id);
        } else {
          this.error = 'No Vendor ID provided.';
          this.isLoading.set(false);
          this.isReviewsLoading.set(false);
        }
      },
      error: (err) => {
        console.error('VendorDetail paramMap error', err);
        this.isLoading.set(false);
        this.isReviewsLoading.set(false);
      }
    });
  }

  ngAfterViewInit() {
    this.checkAndInitMap();
  }

  ngOnDestroy() {
    this.voiceService.stop();
    if (this.map) {
      this.map.remove();
    }
  }

  private checkAndInitMap() {
    if (this.vendor && this.vendor.location?.coordinates) {
        setTimeout(() => this.initMap(), 100);
    }
  }

  private initMap() {
    const coords = this.vendor?.location?.coordinates;
    if (!coords) return;

    let lat: number | undefined;
    let lng: number | undefined;
    // Handle both old {lat, lng} and new GeoJSON [lng, lat] formats
    if (Array.isArray(coords)) {
        lng = coords[0];
        lat = coords[1];
    } else if (coords && typeof coords === 'object' && 'lat' in coords && 'lng' in coords) {
        lat = (coords as any).lat;
        lng = (coords as any).lng;
    }

    if (lat === undefined || lng === undefined) {
        console.warn('Audit: Invalid coordinates', coords);
        return;
    }

    // If map already exists, just update it
    if (this.map) {
        this.updateMap(lat, lng);
        return;
    }

    const mapElement = document.getElementById('detail-map');
    if (!mapElement) {
        console.warn('Audit: detail-map element not found yet');
        return;
    }

    console.log(`Audit: Initializing detail map at [${lat}, ${lng}]`);
    this.map = L.map('detail-map', {
      center: [lat, lng],
      zoom: 15,
      zoomControl: false,
      scrollWheelZoom: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    // Fix default marker icon issue
    const DefaultIcon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });
    L.Marker.prototype.options.icon = DefaultIcon;

    this.marker = L.marker([lat, lng]).addTo(this.map);

    // Persistent invalidation loop to fix "gray box" which happens when 
    // container is initialy zero-height (common in Angular tab/flex layouts)
    let attempts = 0;
    const invalidateInterval = setInterval(() => {
        if (this.map) {
            this.map.invalidateSize();
            const size = this.map.getSize();
            if (size.x > 0 && size.y > 0) {
                console.log('Audit: Map rendered successfully after', attempts, 'attempts');
                clearInterval(invalidateInterval);
            }
        }
        attempts++;
        if (attempts > 20) clearInterval(invalidateInterval); // Safety break
    }, 200);
  }

  private updateMap(lat: number, lng: number) {
    if (this.map && this.marker) {
        this.map.setView([lat, lng], 15);
        this.marker.setLatLng([lat, lng]);
        this.map.invalidateSize();
    }
  }

  openDirections() {
    const coords = this.vendor?.location?.coordinates;
    if (!coords || !this.vendor) return;

    let lat: number | undefined;
    let lng: number | undefined;
    if (Array.isArray(coords)) {
        lng = coords[0];
        lat = coords[1];
    } else if (coords && typeof coords === 'object' && 'lat' in coords && 'lng' in coords) {
        lat = (coords as any).lat;
        lng = (coords as any).lng;
    }

    if (lat === undefined || lng === undefined) return;

    // By including the name in the query, Google Maps will "snap" to the specific business 
    // even if the coordinate provided has a minor offset from OpenStreetMap.
    const query = encodeURIComponent(`${this.vendor.name}, ${lat},${lng}`);
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    window.open(url, '_blank');
  }

  loadVendor(id: string) {
    this.isLoading.set(true);
    this.error = '';
    
    this.vendorService.getVendorById(id).pipe(
      timeout(5000),
      catchError(err => {
        console.error('VendorDetail fetch failed', err);
        this.error = 'Failed to load vendor details. Please try again later.';
        this.isLoading.set(false);
        return of(null);
      })
    ).subscribe({
      next: (data) => {
        if (!data) return;
        this.vendor = data;
        this.isLoading.set(false);
        this.cdr.detectChanges();
        this.checkIfFavorite();
        this.checkAndInitMap();
        
        // Fetch related contextual spots
        this.vendorService.getRelatedVendors(id).pipe(
            timeout(5000),
            catchError(err => {
                console.error('Related spots failed', err);
                return of([]);
            })
        ).subscribe({
            next: (relatedData: Vendor[]) => {
                this.relatedVendors = relatedData;
                this.cdr.detectChanges();
            }
        });
      }
    });
  }

  checkIfFavorite() {
    if (!this.vendor) return;
    const userStr = localStorage.getItem('user_data');
    if (userStr) {
      const user = JSON.parse(userStr);
      this.userService.getProfile(user.id || user._id).subscribe({
        next: (profile) => {
          if (profile && this.vendor) {
            this.isFavorite.set(profile.favorites?.some((res: any) => 
               (typeof res === 'string' ? res : res._id) === this.vendor?._id
            ) || false);

            this.isSaved.set(profile.savedPlaces?.some((res: any) => 
               (typeof res === 'string' ? res : res._id) === this.vendor?._id
            ) || false);

            this.isVisited.set(profile.visited?.some((res: any) => 
               (typeof res === 'string' ? res : res._id) === this.vendor?._id
            ) || false);
          }
        }
      });
    }
  }

  shareVendor() {
    if (!this.vendor) return;
    
    if (navigator.share) {
      navigator.share({
        title: this.vendor.name,
        text: `Taste the Story. Discover the Kapampangan Roots of ${this.vendor.name}!`,
        url: window.location.href
      }).catch(err => {
        console.log('Action [Share]: Native share failed', err);
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  }

  toggleFavorite() {
    if (this.connectionService.isOffline()) {
      alert("You are currently offline. Please connect to the internet to save this to your favorites.");
      return;
    }

    if (!this.authService.isUserLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    if (!this.vendor) return;

    const userStr = localStorage.getItem('user_data');
    if (userStr) {
      const user = JSON.parse(userStr);
      this.userService.toggleFavorite(user.id || user._id, this.vendor._id).subscribe({
        next: (res) => {
          this.isFavorite.set(!this.isFavorite());
        },
        error: (err) => {
          console.error('Action [Favorite]: Toggle failed', err);
        }
      });
    }
  }

  toggleSaved() {
    if (this.connectionService.isOffline()) {
      alert("You are currently offline. Please connect to the internet to save this place.");
      return;
    }

    if (!this.authService.isUserLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    if (!this.vendor) return;

    const userStr = localStorage.getItem('user_data');
    if (userStr) {
      const user = JSON.parse(userStr);
      this.userService.toggleSavedPlace(user.id || user._id, this.vendor._id).subscribe({
        next: (res) => {
          this.isSaved.set(!this.isSaved());
        },
        error: (err) => {
          console.error('Action [Saved]: Toggle failed', err);
        }
      });
    }
  }

  toggleVisited() {
    if (this.connectionService.isOffline()) {
      alert("You are currently offline. Please connect to the internet to mark this as visited.");
      return;
    }

    if (!this.authService.isUserLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    if (!this.vendor) return;

    const userStr = localStorage.getItem('user_data');
    if (userStr) {
      const user = JSON.parse(userStr);
      this.userService.toggleVisited(user.id || user._id, this.vendor._id).subscribe({
        next: (res) => {
          this.isVisited.set(!this.isVisited());
        },
        error: (err) => {
          console.error('Action [Visited]: Toggle failed', err);
        }
      });
    }
  }

  writeReview() {
    if (this.connectionService.isOffline()) {
      alert("You are currently offline. Please connect to the internet to write a review.");
      return;
    }

    if (!this.authService.isUserLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.showReviewModal.set(true);
  }

  loadReviews(vendorId?: string) {
    const id = vendorId || this.vendor?._id;
    if (!id) return;
    
    this.isReviewsLoading.set(true);
    this.reviewService.getReviews(id).subscribe({
      next: (data) => {
        this.reviews = data;
        this.isReviewsLoading.set(false);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Action [Reviews]: Fetch failed', err);
        this.isReviewsLoading.set(false);
        this.cdr.detectChanges();
      }
    });
  }

  submitReview() {
    if (this.connectionService.isOffline()) {
      alert("You are currently offline. Cannot submit your review.");
      return;
    }

    if (!this.vendor || !this.newReview.comment.trim()) return;
    
    const userStr = localStorage.getItem('user_data');
    if (!userStr) return;
    
    const user = JSON.parse(userStr);
    this.isSubmittingReview.set(true);

    const reviewData: Review = {
      vendorId: this.vendor._id,
      userId: user.id || user._id,
      userName: user.full_name || user.name || 'Anonymous',
      rating: this.newReview.rating,
      comment: this.newReview.comment
    };

    this.reviewService.addReview(this.vendor._id, reviewData).subscribe({
      next: (res) => {
        this.reviews.unshift(res);
        this.showReviewModal.set(false);
        this.isSubmittingReview.set(false);
        this.newReview = { rating: 5, comment: '' };
        // Optionally reload vendor to get updated rating/count
        if (this.vendor) this.loadVendor(this.vendor._id);
      },
      error: (err) => {
        console.error('Action [Review]: Submission failed', err);
        this.isSubmittingReview.set(false);
      }
    });
  }

  toggleStory(text: string) {
    if (this.isSpeaking()) {
      this.voiceService.stop();
    } else {
      this.voiceService.speak(text);
    }
  }

  openMenuPopup(item: any) {
    this.selectedMenuItem.set(item);
    this.showMenuPopup.set(true);
  }

  closeMenuPopup() {
    this.showMenuPopup.set(false);
    setTimeout(() => this.selectedMenuItem.set(null), 300);
  }

  openGalleryPopup(image: string) {
    this.selectedGalleryImage.set(image);
    this.showGalleryPopup.set(true);
  }

  closeGalleryPopup() {
    this.showGalleryPopup.set(false);
    setTimeout(() => this.selectedGalleryImage.set(null), 300);
  }
}
