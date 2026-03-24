import { Component, inject, signal, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { LucideAngularModule, Camera, Store, Clock, BookOpen, Heart, ShieldCheck, Sparkles, X, Plus, Trash2, Check, Loader, Landmark, MapPin, Navigation, Info } from 'lucide-angular';
import { SubmissionService } from '../../services/submission';
import { Router } from '@angular/router';
import * as L from 'leaflet';
import { Subject, debounceTime, distinctUntilChanged, switchMap, of, catchError } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-submit-listing',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, ReactiveFormsModule],
  templateUrl: './submit-listing.html',
  styleUrl: './submit-listing.css',
})
export class SubmitListing implements OnInit, AfterViewInit, OnDestroy {
  private fb = inject(FormBuilder);
  private submissionService = inject(SubmissionService);
  private router = inject(Router);
  private http = inject(HttpClient);

  // Grab the map element safely via Angular's ViewChild (same pattern as explore-map)
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;

  submitForm: FormGroup;
  selectedFiles: File[] = [];
  readonly navigationIcon = Navigation;
  imagePreviews: string[] = [];
  menuItemImages: (File | null)[] = [];
  isLoading = signal(false);
  isSuccess = signal(false);
  errorMessage = signal('');
  isHeritageSite = signal(false);
  
  // Map properties
  private map?: L.Map;
  private marker?: L.Marker;
  private readonly defaultCoords: [number, number] = [15.1449, 120.5887]; // Angeles City
  suggestions = signal<any[]>([]);
  showSuggestions = signal(false);
  private searchSubject = new Subject<string>();

  constructor() {
    this.submitForm = this.fb.group({
      name: ['', Validators.required],
      yearsInOperation: ['', [Validators.required, Validators.pattern(/^(\d+\s+years|Since\s+\d{4})$/i)]],
      category: ['Local Eatery', Validators.required],
      culturalStory: ['', [Validators.required, Validators.maxLength(500)]],
      address: ['', Validators.required],
      latitude: [this.defaultCoords[0]],
      longitude: [this.defaultCoords[1]],
      authenticityTraits: this.fb.array([]),
      menuHighlights: this.fb.array([]),
      // Heritage Site specific
      historicalSignificance: [''],
      yearEstablished: ['', Validators.pattern(/^\d{4}$/)]
    });

    // Setup address search debounce
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

  ngOnInit() {
    // Listen to category changes to toggle conditional fields
    this.submitForm.get('category')?.valueChanges.subscribe(value => {
      const isHeritage = value === 'Heritage Site';
      this.isHeritageSite.set(isHeritage);
      
      const yearsControl = this.submitForm.get('yearsInOperation');
      const storyControl = this.submitForm.get('culturalStory');
      const significanceControl = this.submitForm.get('historicalSignificance');
      const establishedControl = this.submitForm.get('yearEstablished');

      if (isHeritage) {
        // Clear and make optional for Heritage Site
        yearsControl?.clearValidators();
        storyControl?.clearValidators();
        
        // Heritage Site requirements
        significanceControl?.setValidators([Validators.required]);
        establishedControl?.setValidators([Validators.required, Validators.pattern(/^\d{4}$/)]);
        
        // Clear menu highlights
        while (this.menuHighlights.length) this.menuHighlights.removeAt(0);
        this.menuItemImages = [];
      } else {
        // Restore validators for Local Eatery
        yearsControl?.setValidators([Validators.required, Validators.pattern(/^(\d+\s+years|Since\s+\d{4})$/i)]);
        storyControl?.setValidators([Validators.required, Validators.maxLength(500)]);
        
        // Clear heritage requirements
        significanceControl?.clearValidators();
        establishedControl?.setValidators([Validators.pattern(/^\d{4}$/)]);
        
        // Clear heritage fields
        this.submitForm.patchValue({ historicalSignificance: '', yearEstablished: '' });
      }
      
      yearsControl?.updateValueAndValidity();
      storyControl?.updateValueAndValidity();
      significanceControl?.updateValueAndValidity();
      establishedControl?.updateValueAndValidity();
    });
  }

  ngAfterViewInit() {
    // Matches explore-map pattern: init map directly in ngAfterViewInit
    this.initMap();
  }

  ngOnDestroy() {
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
    // Use the native element from ViewChild (same pattern as explore-map)
    const mapEl = this.mapContainer?.nativeElement;

    if (!mapEl) {
      console.error('Audit: mapContainer element not found by ViewChild!');
      return;
    }

    // Force the element to have explicit dimensions before Leaflet initializes
    mapEl.style.width = '100%';
    mapEl.style.height = '300px';

    this.map = L.map(mapEl, {
      center: this.defaultCoords,
      zoom: 14,
      scrollWheelZoom: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    // Fix marker icon issue for Leaflet in contemporary build systems
    const defaultIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
    L.Marker.prototype.options.icon = defaultIcon;

    this.marker = L.marker(this.defaultCoords, { draggable: true }).addTo(this.map);

    this.marker.on('dragend', () => this.onMarkerDragEnd());
    
    // Allow clicking map to set location
    this.map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        this.updateMarker(lat, lng);
        this.performReverseGeocoding(lat, lng);
    });

    // Give Angular time to finish rendering the CSS layout,
    // then force Leaflet to recalculate the size and fetch tiles.
    setTimeout(() => {
      if (this.map) {
        this.map.invalidateSize();
      }
    }, 100);
  }

  private updateMarker(lat: number, lng: number) {
    if (!this.marker || !this.map) return;
    this.marker.setLatLng([lat, lng]);
    this.map.setView([lat, lng], 16);
    this.map.invalidateSize(); // Ensure tiles are correct after view change
    this.submitForm.patchValue({ latitude: lat, longitude: lng });
  }

  onAddressInput(event: any) {
    const query = event.target.value;
    this.searchSubject.next(query);
  }

  selectSuggestion(suggestion: any) {
    const lat = parseFloat(suggestion.lat);
    const lon = parseFloat(suggestion.lon);
    
    this.updateMarker(lat, lon);
    this.submitForm.patchValue({
      address: suggestion.display_name,
      latitude: lat,
      longitude: lon
    });
    this.showSuggestions.set(false);
  }

  private onMarkerDragEnd() {
    if (!this.marker) return;
    const { lat, lng } = this.marker.getLatLng();
    this.submitForm.patchValue({ latitude: lat, longitude: lng });
    this.performReverseGeocoding(lat, lng);
  }

  private performReverseGeocoding(lat: number, lng: number) {
    this.http.get<any>(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
      .subscribe(res => {
        if (res && res.display_name) {
          this.submitForm.patchValue({ address: res.display_name });
        }
      });
  }

  locateMe() {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        this.updateMarker(latitude, longitude);
        this.performReverseGeocoding(latitude, longitude);
      },
      () => alert('Unable to retrieve your location')
    );
  }

  get authenticityTraits() { return this.submitForm.get('authenticityTraits') as FormArray; }
  get menuHighlights() { return this.submitForm.get('menuHighlights') as FormArray; }

  addTrait() { this.authenticityTraits.push(this.fb.control('', Validators.required)); }
  removeTrait(index: number) { this.authenticityTraits.removeAt(index); }

  addMenuItem() {
    const itemForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      price: [0, [Validators.required, Validators.min(0)]]
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
        if (this.selectedFiles.length < 4) {
          const file = files[i];
          this.selectedFiles.push(file);

          // FileReader for instant image preview
          const reader = new FileReader();
          reader.onload = (e: any) => {
            this.imagePreviews.push(e.target.result);
          };
          reader.readAsDataURL(file);
        }
      }
    }
  }

  onMenuItemFileSelect(event: any, index: number) {
    const file = event.target.files[0];
    if (file) this.menuItemImages[index] = file;
  }

  removeFile(index: number) {
    this.selectedFiles.splice(index, 1);
    this.imagePreviews.splice(index, 1);
  }

  dismissError() {
    this.errorMessage.set('');
  }

  private playFeedbackSound(type: 'success' | 'error') {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContext();
      
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      if (type === 'success') {
        // Cheerful arpeggiating Sparkle-like sound
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1); // A5
        osc.frequency.exponentialRampToValueAtTime(1046.50, ctx.currentTime + 0.2); // C6
        
        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
        
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.8);
      } else {
        // Subtle error blip
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.3);
        
        gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch(e) { /* Ignore audio errors */ }
  }

  onSubmit() {
    if (this.submitForm.invalid || this.selectedFiles.length === 0) {
      if (this.selectedFiles.length === 0) {
          this.errorMessage.set('Please provide at least one photo of the vendor so the community can see it.');
      } else {
          this.errorMessage.set('Some fields are missing or invalid. Please review the highlighted boxes and try again.');
      }
      this.playFeedbackSound('error');
      this.submitForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const formData = new FormData();
    formData.append('name', this.submitForm.value.name);
    formData.append('category', this.submitForm.value.category);
    formData.append('address', this.submitForm.value.address);
    console.log('Audit: Form Values before submission', this.submitForm.value);
    
    formData.append('latitude', this.submitForm.value.latitude);
    formData.append('longitude', this.submitForm.value.longitude);
    
    formData.append('authenticityTraits', JSON.stringify(this.submitForm.value.authenticityTraits));

    if (!this.isHeritageSite()) {
      formData.append('yearsInOperation', this.submitForm.value.yearsInOperation);
      formData.append('culturalStory', this.submitForm.value.culturalStory);
      // Local Eatery: send menu highlights
      formData.append('menuHighlights', JSON.stringify(this.submitForm.value.menuHighlights));
      this.menuItemImages.forEach(file => {
        if (file) formData.append('menuItemImages', file);
      });
    } else {
      // Heritage Site: send historical fields
      formData.append('historicalSignificance', this.submitForm.value.historicalSignificance || '');
      formData.append('yearEstablished', this.submitForm.value.yearEstablished || '');
    }

    this.selectedFiles.forEach(file => formData.append('images', file));

    this.submissionService.submitListing(formData).subscribe({
      next: (res) => {
        console.log('Audit: Submission Success', res);
        this.isLoading.set(false);
        this.isSuccess.set(true);
        this.playFeedbackSound('success');
        setTimeout(() => this.router.navigate(['/']), 2000);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(`Network Error: We couldn't safely store your submission. Please try again! Error: ${err.message}`);
        this.playFeedbackSound('error');
      }
    });
  }
}
