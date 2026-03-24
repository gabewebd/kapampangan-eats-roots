import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../services/auth';
import { LucideAngularModule, Loader, Check, LogOut, Activity, X, BadgeCheck, Eye, Pencil, Trash2, ChevronRight, Star, Landmark, BookOpen } from 'lucide-angular';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

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
export class AdminDashboard implements OnInit {
  private adminService = inject(AdminService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

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

  vendors = signal<any[]>([]);
  metrics = signal<any>(null);
  loading = signal(true);
  error = signal('');
  
  editForm!: FormGroup;
  
  activeTab = signal<'audit' | 'analytics'>('audit');
  auditStatus = signal<'pending' | 'approved' | 'verified' | 'rejected'>('pending');
  
  selectedVendor = signal<any>(null);
  isDetailModalOpen = signal(false);
  isEditModalOpen = signal(false);
  
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

  ngOnInit() {
    console.log('Audit: Admin Dashboard Init');
    this.initEditForm();
    this.refreshData();
    this.loadMetrics();
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
      yearEstablished: ['']
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

  refreshData() {
    this.loading.set(true);
    this.error.set('');
    
    if (this.auditStatus() === 'pending') {
      this.adminService.getPendingVendors().subscribe({
        next: (data) => {
          this.vendors.set(data);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set('Failed to load pending submissions.');
          this.loading.set(false);
        }
      });
    } else {
      this.adminService.getVendorsByStatus(this.auditStatus()).subscribe({
        next: (data) => {
          this.vendors.set(data);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(`Failed to load ${this.auditStatus()} listings.`);
          this.loading.set(false);
        }
      });
    }
  }

  loadMetrics() {
    this.adminService.getDashboardMetrics().subscribe({
      next: (data) => {
        this.metrics.set(data);
      },
      error: (err) => {
        console.error('Audit: Failed to load metrics', err);
      }
    });
  }

  setAuditStatus(status: 'pending' | 'approved' | 'verified' | 'rejected') {
    this.auditStatus.set(status);
    this.refreshData();
  }

  onApprove(id: string) {
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
    this.editForm.patchValue({
      _id: vendor._id,
      name: vendor.name,
      category: vendor.category,
      address: vendor.location?.address || '',
      yearsInOperation: vendor.yearsInOperation || '',
      culturalStory: vendor.culturalStory || '',
      historicalSignificance: vendor.historicalSignificance || '',
      yearEstablished: vendor.yearEstablished || ''
    });
    this.isEditModalOpen.set(true);
  }

  saveEdit() {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    const formValue = this.editForm.value;
    // Map address back to location object for backend
    const updateData = {
      ...formValue,
      location: {
        ...this.selectedVendor().location,
        address: formValue.address
      }
    };

    this.adminService.updateVendor(formValue._id, updateData).subscribe({
      next: () => {
        this.isEditModalOpen.set(false);
        this.refreshData();
        this.loadMetrics();
        this.showFeedback('Updated!', 'Listing changes have been safely stored.');
      },
      error: (err) => alert('Update failed.')
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
