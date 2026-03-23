import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../services/auth';
import { LucideAngularModule, Loader, Check, LogOut, Activity, X, BadgeCheck, Eye } from 'lucide-angular';
import { ApprovalItem } from '../../components/admin/approval-item/approval-item';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    ApprovalItem,
    FormsModule
  ],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard implements OnInit {
  private adminService = inject(AdminService);
  private authService = inject(AuthService);
  private router = inject(Router);

  readonly loader = Loader;
  readonly check = Check;
  readonly logOut = LogOut;
  readonly activity = Activity;

  pendingVendors: any[] = [];
  metrics: any = null;
  loading = signal(true);
  error = signal('');
  selectedVendor = signal<any>(null);
  evaluatingVendorId = signal<string | null>(null);
  asfScores = {
    historicalContinuity: 5,
    culturalAuthenticity: 5,
    communityRelevance: 5,
    heritageDocumentation: 5,
    digitalNarrativeQuality: 5
  };
  activeTab = signal<'audit' | 'analytics'>('audit');
  today = new Date();

  ngOnInit() {
    console.log('Audit: Admin Dashboard Init');
    this.refreshData();
  }

  refreshData() {
    this.loading.set(true);
    this.error.set('');
    
    // Fetch pending vendors
    this.adminService.getPendingVendors().subscribe({
      next: (data) => {
        this.pendingVendors = data;
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load pending submissions.');
        this.loading.set(false);
      }
    });

    // Fetch metrics
    this.adminService.getDashboardMetrics().subscribe({
      next: (data) => {
        this.metrics = data;
      },
      error: (err) => {
        console.error('Audit: Failed to load metrics', err);
      }
    });
  }

  onApprove(id: string) {
    alert('Processing approval...');
    console.log(`Audit: Approving vendor ${id}`);
    this.adminService.approveVendor(id).subscribe({
      next: (res) => {
        console.log('Audit: Approval Success', res);
        this.selectedVendor.set(null);
        this.refreshData();
      },
      error: (err) => {
        console.error('Audit: Approval Error', err);
        alert('Verification update failed. See console.');
      }
    });
  }

  onReject(id: string) {
    if (confirm('Audit: Confirm rejection and permanent deletion?')) {
      alert('Processing rejection...');
      console.log(`Audit: Rejecting vendor ${id}`);
      this.adminService.rejectVendor(id).subscribe({
        next: (res) => {
          console.log('Audit: Rejection Success', res);
          this.selectedVendor.set(null);
          this.refreshData();
        },
        error: (err) => {
          console.error('Audit: Rejection Error', err);
          alert('Deletion failed. See console.');
        }
      });
    }
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
    console.log(`Audit: Authenticating vendor ${id}`);
    this.adminService.authenticateVendor(id, this.asfScores).subscribe({
      next: (res) => {
        console.log('Audit: Authentication Success', res);
        alert('Vendor marked as Verified Authentic!');
        this.evaluatingVendorId.set(null);
      },
      error: (err) => {
        console.error('Audit: Authentication Error', err);
        alert('Authentication failed. See console.');
      }
    });
  }

  viewDetails(vendor: any) {
    this.selectedVendor.set(
      this.selectedVendor()?._id === vendor._id ? null : vendor
    );
  }

  closeDetails() {
    this.selectedVendor.set(null);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/admin-login']);
  }
}
