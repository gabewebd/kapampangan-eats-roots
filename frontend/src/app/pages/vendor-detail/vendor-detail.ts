import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { VendorService, Vendor } from '../../services/vendor';
import { LucideAngularModule, Calendar, MapPin, BadgeCheck, BookOpen, Quote, Landmark, Activity, ChevronRight, Clock, Star, Map, Loader, ArrowLeft, Share2, Heart, PenLine, Bookmark, Check } from 'lucide-angular';
import { AuthService } from '../../services/auth';
import { UserService } from '../../services/user.service';
import { ReviewService, Review } from '../../services/review.service';
import { timeout, catchError, of } from 'rxjs';

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
    LucideAngularModule.pick({ Calendar, MapPin, BadgeCheck, BookOpen, Quote, Landmark, Activity, ChevronRight, Clock, Star, Map, Loader, ArrowLeft, Share2, Heart, PenLine, Bookmark, Check, X: 'x' as any }).providers!
  ],
  templateUrl: './vendor-detail.html',
  styleUrl: './vendor-detail.css',
})
export class VendorDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private vendorService = inject(VendorService);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private reviewService = inject(ReviewService);
  private router = inject(Router);

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

  isLoading = signal(true);
  isReviewsLoading = signal(true);
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
        this.checkIfFavorite();
        
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
        text: `Taste the Story. Discover the Roots of ${this.vendor.name} in Angeles City!`,
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
      },
      error: (err) => {
        console.error('Action [Reviews]: Fetch failed', err);
        this.isReviewsLoading.set(false);
      }
    });
  }

  submitReview() {
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
}
