import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../services/auth';
import { LucideAngularModule } from 'lucide-angular';

// Import Admin Components
import { MetricCard } from '../../components/admin/metric-card/metric-card';
import { EngagementChart } from '../../components/admin/engagement-chart/engagement-chart';
import { TrendingList } from '../../components/admin/trending-list/trending-list';
import { ApprovalItem } from '../../components/admin/approval-item/approval-item';
import { ImpactInsight } from '../../components/admin/impact-insight/impact-insight';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    MetricCard,
    EngagementChart,
    TrendingList,
    ApprovalItem,
    ImpactInsight
  ],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard implements OnInit {
  private adminService = inject(AdminService);
  private authService = inject(AuthService);
  private router = inject(Router);

  metrics: any = null;
  pendingVendors: any[] = [];
  loading = true;
  error = '';
  today = new Date();

  ngOnInit() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/admin-login']);
      return;
    }
    this.refreshData();
  }

  refreshData() {
    this.loading = true;
    this.adminService.getDashboardMetrics().subscribe({
      next: (data) => {
        this.metrics = data;
        this.loadPendingVendors();
      },
      error: (err) => {
        this.error = 'Failed to load dashboard metrics.';
        this.loading = false;
      }
    });
  }

  loadPendingVendors() {
    this.adminService.getPendingVendors().subscribe({
      next: (data) => {
        this.pendingVendors = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load pending vendors.';
        this.loading = false;
      }
    });
  }

  onApprove(id: string) {
    this.adminService.approveVendor(id).subscribe({
      next: () => this.refreshData(),
      error: () => alert('Approval failed.')
    });
  }

  onReject(id: string) {
    if (confirm('Are you sure you want to reject and delete this listing?')) {
      this.adminService.rejectVendor(id).subscribe({
        next: () => this.refreshData(),
        error: () => alert('Rejection failed.')
      });
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/admin-login']);
  }
}
