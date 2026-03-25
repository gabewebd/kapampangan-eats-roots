import { Component, OnInit, inject, signal, ViewChild, ElementRef, AfterViewInit, OnDestroy, computed, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../services/auth';
import { ConnectionService } from '../../services/connection.service';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { LucideAngularModule, Loader, Check, LogOut, Activity, X, BadgeCheck, Eye, Pencil, Trash2, ChevronRight, Star, Landmark, BookOpen, Camera, Plus, Utensils, Navigation, Info, Search, MapPin } from 'lucide-angular';
import * as L from 'leaflet';
import { HttpClient } from '@angular/common/http';
import { Subject, debounceTime, distinctUntilChanged, switchMap, of, catchError } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard implements OnInit, OnDestroy {
  private adminService = inject(AdminService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  private connectionService = inject(ConnectionService);

  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;

  readonly loader = Loader;
  readonly check = Check;
  readonly logOut = LogOut;
  readonly activity = Activity;
  readonly eye = Eye;
  readonly pencil = Pencil;
  readonly trash = Trash2;
  readonly badgeCheck = BadgeCheck;
  readonly chevronRight = ChevronRight;
  readonly star = Star;
  readonly xIcon = X;
  readonly landmark = Landmark;
  readonly book = BookOpen;
  readonly camera = Camera;
  readonly plus = Plus;
  readonly utensils = Utensils;
  readonly navigation = Navigation;
  readonly info = Info;
  readonly search = Search;

  vendors = signal<any[]>([]);
  metrics = signal<any>(null);
  loading = signal(true);
  error = signal('');
  
  editForm!: FormGroup;
  
  activeTab = signal<'audit' | 'analytics'>('audit');
  auditStatus = signal<'pending' | 'approved' | 'verified' | 'rejected'>('pending');
  
  // Search and Filter signals
  searchQuery = signal('');
  categoryFilter = signal<'all' | 'Local Eatery' | 'Heritage Site'>('all');

  filteredVendors = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const cat = this.categoryFilter();
    const list = this.vendors() || [];

    return list.filter(v => {
      const matchesCategory = cat === 'all' || v.category === cat;
      const matchesSearch = !query || 
        v.name?.toLowerCase().includes(query) || 
        v.location?.address?.toLowerCase().includes(query);
      
      return matchesCategory && matchesSearch;
    });
  });
  
  selectedVendor = signal<any>(null);
  isDetailModalOpen = signal(false);
  isEditModalOpen = signal(false);
  
  // Image management for editing
  selectedFiles: File[] = [];
  imagePreviews: string[] = []; // New uploads
  existingImages: string[] = []; // URLs to keep
  menuItemImages: (File | null)[] = [];
  
  // Custom Confirmation Modal State
  confirmDialog = signal<{
    isOpen: boolean;
    title: string;
    message: string;
    action: () => void;
    isDanger: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    action: () => {},
    isDanger: false
  });

  notificationMode = signal(false);
  
  evaluatingVendorId = signal<string | null>(null);
  asfScores: Record<string, number> = {
    historicalContinuity: 5,
    culturalAuthenticity: 5,
    communityRelevance: 5,
    heritageDocumentation: 5,
    digitalNarrativeQuality: 5
  };
  
  today = new Date();

  // Map properties
  private map?: L.Map;
  private marker?: L.Marker;
  private readonly defaultCoords: [number, number] = [15.1449, 120.5887];
  suggestions = signal<any[]>([]);
  showSuggestions = signal(false);
  private searchSubject = new Subject<string>();

  ngOnInit() {
    console.log('Audit: Admin Dashboard Init');
    this.initEditForm();
    this.refreshData();
    this.loadMetrics();
    this.setupAddressSearch();
  }

  ngOnDestroy() {
    if (this.map) this.map.remove();
  }

  setupAddressSearch() {
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap(query => {
        if (query.length < 3) return of([]);
        return this.http.get<any[]>(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`);
      }),
      catchError(() => of([]))
    ).subscribe(results => {
      this.suggestions.set(results);
      this.showSuggestions.set(results.length > 0);
    });
  }

  initEditForm() {
    this.editForm = this.fb.group({
      _id: [''],
      name: ['', Validators.required],
      category: ['', Validators.required],
      address: ['', Validators.required],
      yearsInOperation: [''],
      culturalStory: [''],
      historicalSignificance: [''],
      yearEstablished: [''],
      latitude: [15.1449],
      longitude: [120.5887],
      authenticityTraits: this.fb.array([]),
      menuHighlights: this.fb.array([])
    });

    // Handle conditional validation based on category
    this.editForm.get('category')?.valueChanges.subscribe(category => {
      const yearsControl = this.editForm.get('yearsInOperation');
      const storyControl = this.editForm.get('culturalStory');
      const significanceControl = this.editForm.get('historicalSignificance');
      const establishedControl = this.editForm.get('yearEstablished');

      if (category === 'Heritage Site') {
        yearsControl?.clearValidators();
        storyControl?.clearValidators();
        significanceControl?.setValidators([Validators.required]);
        establishedControl?.setValidators([Validators.required, Validators.pattern(/^\d{4}$/)]);
      } else {
        yearsControl?.setValidators([Validators.required, Validators.pattern(/^(\d+\s+years|Since\s+\d{4})$/i)]);
        storyControl?.setValidators([Validators.required]);
        significanceControl?.clearValidators();
        establishedControl?.clearValidators();
      }
      
      yearsControl?.updateValueAndValidity();
      storyControl?.updateValueAndValidity();
      significanceControl?.updateValueAndValidity();
      establishedControl?.updateValueAndValidity();
    });
  }

  // Map Initialization
  initMap(lat: number, lng: number) {
    if (this.map) {
      this.map.remove();
    }

    setTimeout(() => {
      const mapEl = this.mapContainer?.nativeElement;
      if (!mapEl) return;

      this.map = L.map(mapEl).setView([lat, lng], 15);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(this.map);

      const defaultIcon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        shadowSize: [41, 41]
      });

      this.marker = L.marker([lat, lng], { icon: defaultIcon, draggable: true }).addTo(this.map);
      this.marker.on('dragend', () => {
        const pos = this.marker!.getLatLng();
        this.editForm.patchValue({ latitude: pos.lat, longitude: pos.lng });
        this.performReverseGeocoding(pos.lat, pos.lng);
      });

      // Simple Click to move
      this.map.on('click', (e: L.LeafletMouseEvent) => {
        this.updateMarker(e.latlng.lat, e.latlng.lng);
        this.performReverseGeocoding(e.latlng.lat, e.latlng.lng);
      });
    }, 100);
  }

  updateMarker(lat: number, lng: number) {
    if (!this.marker || !this.map) return;
    this.marker.setLatLng([lat, lng]);
    this.map.panTo([lat, lng]);
    this.editForm.patchValue({ latitude: lat, longitude: lng });
  }

  performReverseGeocoding(lat: number, lng: number) {
    this.http.get<any>(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
      .subscribe(res => {
        if (res && res.display_name) {
          this.editForm.patchValue({ address: res.display_name });
        }
      });
  }

  onAddressInput(event: any) {
    this.searchSubject.next(event.target.value);
  }

  selectSuggestion(suggestion: any) {
    const lat = parseFloat(suggestion.lat);
    const lon = parseFloat(suggestion.lon);
    this.updateMarker(lat, lon);
    this.editForm.patchValue({ address: suggestion.display_name });
    this.showSuggestions.set(false);
  }

  // Getters for FormArrays
  get authenticityTraits() { return this.editForm.get('authenticityTraits') as FormArray; }
  get menuHighlights() { return this.editForm.get('menuHighlights') as FormArray; }

  addTrait(value: string = '') { 
    this.authenticityTraits.push(this.fb.control(value, Validators.required)); 
  }
  
  removeTrait(index: number) { 
    this.authenticityTraits.removeAt(index); 
  }

  addMenuItem(item: any = null) {
    const itemForm = this.fb.group({
      name: [item?.name || '', Validators.required],
      description: [item?.description || ''],
      price: [item?.price || 0, [Validators.required, Validators.min(0)]],
      image: [item?.image || '']
    });
    this.menuHighlights.push(itemForm);
    this.menuItemImages.push(null);
  }

  removeMenuItem(index: number) {
    this.menuHighlights.removeAt(index);
    this.menuItemImages.splice(index, 1);
  }

  onFileSelect(event: any) {
    const files = event.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const totalPhotos = this.existingImages.length + this.selectedFiles.length;
        if (totalPhotos < 4) {
          const file = files[i];
          this.selectedFiles.push(file);
          const reader = new FileReader();
          reader.onload = (e: any) => {
            this.imagePreviews.push(e.target.result);
            this.cdr.detectChanges();
          };
          reader.readAsDataURL(file);
        }
      }
    }
  }

  onMenuItemFileSelect(event: any, index: number) {
    const file = event.target.files[0];
    if (file) {
      this.menuItemImages[index] = file;
      // Mark for upload on backend
      this.menuHighlights.at(index).patchValue({ hasNewPhoto: true });
    }
  }

  removeExistingImage(index: number) {
    this.existingImages.splice(index, 1);
    this.cdr.detectChanges();
  }

  removeNewImage(index: number) {
    this.selectedFiles.splice(index, 1);
    this.imagePreviews.splice(index, 1);
    this.cdr.detectChanges();
  }

  refreshData() {
    this.loading.set(true);
    this.error.set('');
    
    if (this.auditStatus() === 'pending') {
      this.adminService.getPendingVendors().subscribe({
        next: (data) => {
          this.vendors.set(data);
          this.loading.set(false);
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error.set('Failed to load pending submissions.');
          this.loading.set(false);
          this.cdr.detectChanges();
        }
      });
    } else {
      this.adminService.getVendorsByStatus(this.auditStatus()).subscribe({
        next: (data) => {
          this.vendors.set(data);
          this.loading.set(false);
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error.set(`Failed to load ${this.auditStatus()} listings.`);
          this.loading.set(false);
          this.cdr.detectChanges();
        }
      });
    }
  }

  loadMetrics() {
    this.adminService.getDashboardMetrics().subscribe({
      next: (data) => {
        this.metrics.set(data);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Audit: Failed to load metrics', err);
        this.cdr.detectChanges();
      }
    });
  }

  setAuditStatus(status: 'pending' | 'approved' | 'verified' | 'rejected') {
    this.auditStatus.set(status);
    this.refreshData();
  }

  onApprove(id: string) {
    if (this.connectionService.isOffline()) {
      this.error.set('You are currently offline. Cannot approve vendors.');
      return;
    }

    this.confirmDialog.set({
      isOpen: true,
      title: 'Approve Listing?',
      message: 'This will make the listing visible to all users on the platform.',
      isDanger: false,
      action: () => {
        this.adminService.approveVendor(id).subscribe({
          next: () => {
            this.refreshData();
            this.loadMetrics();
            this.closeConfirm();
          },
          error: (err) => alert('Approval failed.')
        });
      }
    });
  }

  onReject(id: string) {
    if (this.connectionService.isOffline()) {
      this.error.set('You are currently offline. Cannot reject vendors.');
      return;
    }

    this.confirmDialog.set({
      isOpen: true,
      title: 'Reject Listing?',
      message: 'This will move the listing to the Rejected list and hide it from users.',
      isDanger: true,
      action: () => {
        this.adminService.rejectVendor(id).subscribe({
          next: () => {
            this.refreshData();
            this.closeConfirm();
          },
          error: (err) => alert('Rejection failed.')
        });
      }
    });
  }

  onRestore(id: string) {
    if (this.connectionService.isOffline()) {
      this.error.set('You are currently offline. Cannot restore vendors.');
      return;
    }

    this.confirmDialog.set({
      isOpen: true,
      title: 'Restore Listing?',
      message: 'This will move the listing back to the Approved list.',
      isDanger: false,
      action: () => {
        // We reuse approveVendor to move back to approved
        this.adminService.approveVendor(id).subscribe({
          next: () => {
            this.refreshData();
            this.closeConfirm();
          },
          error: (err) => alert('Restore failed.')
        });
      }
    });
  }

  onDeletePermanent(id: string) {
    if (this.connectionService.isOffline()) {
      this.error.set('You are currently offline. Cannot delete vendors.');
      return;
    }

    this.confirmDialog.set({
      isOpen: true,
      title: 'Delete Permanently?',
      message: 'This action CANNOT be undone. The listing will be erased from the database.',
      isDanger: true,
      action: () => {
        this.adminService.deleteVendorPermanent(id).subscribe({
          next: () => {
             this.refreshData();
             this.closeConfirm();
          },
          error: (err) => alert('Deletion failed.')
        });
      }
    });
  }

  closeConfirm() {
    this.confirmDialog.update(state => ({ ...state, isOpen: false }));
    this.notificationMode.set(false);
  }

  showFeedback(title: string, message: string) {
    this.confirmDialog.set({
      isOpen: true,
      title,
      message,
      isDanger: false,
      action: () => this.closeConfirm()
    });
    this.notificationMode.set(true);
  }

  openEditModal(vendor: any) {
    this.selectedVendor.set(vendor);
    this.editForm.reset();
    
    // Reset images
    this.existingImages = [...(vendor.images || [])];
    this.selectedFiles = [];
    this.imagePreviews = [];
    this.menuItemImages = [];

    // Reset FormArrays
    while (this.authenticityTraits.length) this.authenticityTraits.removeAt(0);
    while (this.menuHighlights.length) this.menuHighlights.removeAt(0);

    this.editForm.patchValue({
      _id: vendor._id,
      name: vendor.name,
      category: vendor.category,
      address: vendor.location?.address || '',
      yearsInOperation: vendor.yearsInOperation || '',
      culturalStory: vendor.culturalStory || '',
      historicalSignificance: vendor.historicalSignificance || '',
      yearEstablished: vendor.yearEstablished || '',
      latitude: vendor.location?.coordinates?.[1] || 15.1449,
      longitude: vendor.location?.coordinates?.[0] || 120.5887
    });

    // Populate Arrays
    if (vendor.authenticityTraits) {
      vendor.authenticityTraits.forEach((trait: string) => this.addTrait(trait));
    }
    if (vendor.menuHighlights) {
      vendor.menuHighlights.forEach((item: any) => this.addMenuItem(item));
    }

    this.isEditModalOpen.set(true);

    // Init map after structural render
    const lat = vendor.location?.coordinates?.[1] || 15.1449;
    const lng = vendor.location?.coordinates?.[0] || 120.5887;
    this.initMap(lat, lng);
  }

  saveEdit() {
    if (this.connectionService.isOffline()) {
      this.error.set('You are currently offline. Cannot save vendor edits.');
      this.isEditModalOpen.set(false);
      return;
    }

    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    const formValue = this.editForm.getRawValue();
    const formData = new FormData();

    formData.append('name', formValue.name);
    formData.append('category', formValue.category);
    formData.append('address', formValue.address);
    formData.append('yearsInOperation', formValue.yearsInOperation || '');
    formData.append('culturalStory', formValue.culturalStory || '');
    formData.append('historicalSignificance', formValue.historicalSignificance || '');
    formData.append('yearEstablished', formValue.yearEstablished || '');
    
    // Map data
    const location = {
      address: formValue.address,
      type: 'Point',
      coordinates: [formValue.longitude, formValue.latitude]
    };
    formData.append('location', JSON.stringify(location));
    formData.append('latitude', formValue.latitude);
    formData.append('longitude', formValue.longitude);

    // Traits & Menu Highlights
    formData.append('authenticityTraits', JSON.stringify(formValue.authenticityTraits));
    
    // For menu highlights, we need to pass a flag if a new photo was added
    const menuWithFlags = formValue.menuHighlights.map((item: any, idx: number) => ({
      ...item,
      hasNewPhoto: !!this.menuItemImages[idx]
    }));
    formData.append('menuHighlights', JSON.stringify(menuWithFlags));

    // Images
    formData.append('existingImages', JSON.stringify(this.existingImages));
    this.selectedFiles.forEach(file => formData.append('images', file));
    this.menuItemImages.forEach(file => {
      if (file) formData.append('menuItemImages', file);
    });

    this.adminService.updateVendor(formValue._id, formData).subscribe({
      next: () => {
        this.isEditModalOpen.set(false);
        this.refreshData();
        this.loadMetrics();
        this.showFeedback('Updated!', 'Listing changes have been safely stored with images and details.');
      },
      error: (err) => alert('Update failed. Check console for details.')
    });
  }

  startEvaluation(id: string) {
    this.evaluatingVendorId.set(id);
    this.asfScores = {
      historicalContinuity: 5,
      culturalAuthenticity: 5,
      communityRelevance: 5,
      heritageDocumentation: 5,
      digitalNarrativeQuality: 5
    };
  }

  cancelEvaluation() {
    this.evaluatingVendorId.set(null);
  }

  onAuthenticate(id: string) {
    if (this.connectionService.isOffline()) {
      this.error.set('You are currently offline. Cannot authenticate vendors.');
      return;
    }

    this.adminService.authenticateVendor(id, this.asfScores).subscribe({
      next: () => {
        this.showFeedback('Authenticated!', 'Vendor marked as Verified Authentic with ASF Scores.');
        this.evaluatingVendorId.set(null);
        this.refreshData();
        this.loadMetrics();
      },
      error: (err) => alert('Authentication failed.')
    });
  }

  viewDetails(vendor: any) {
    this.selectedVendor.set(vendor);
    this.isDetailModalOpen.set(true);
  }

  closeModals() {
    this.isDetailModalOpen.set(false);
    this.isEditModalOpen.set(false);
    this.selectedVendor.set(null);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/admin-login']);
  }
}
