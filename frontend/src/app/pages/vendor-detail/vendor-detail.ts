import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { VendorService, Vendor } from '../../services/vendor';
import { LucideAngularModule, Calendar, MapPin, BadgeCheck, BookOpen, Quote, Landmark, Activity, ChevronRight, Clock, Star, Map, Loader, ArrowLeft, Share2, Heart, PenLine } from 'lucide-angular';
import { timeout, catchError, of } from 'rxjs';

@Component({
  selector: 'app-vendor-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule
  ],
  providers: [
    LucideAngularModule.pick({ Calendar, MapPin, BadgeCheck, BookOpen, Quote, Landmark, Activity, ChevronRight, Clock, Star, Map, Loader, ArrowLeft, Share2, Heart, PenLine }).providers!
  ],
  templateUrl: './vendor-detail.html',
  styleUrl: './vendor-detail.css',
})
export class VendorDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private vendorService = inject(VendorService);

  vendor: Vendor | null = null;
  relatedVendors: Vendor[] = [];
  isLoading = signal(true);
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
        } else {
          this.error = 'No Vendor ID provided.';
          this.isLoading.set(false);
        }
      },
      error: (err) => {
        console.error('VendorDetail paramMap error', err);
        this.isLoading.set(false);
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
}
