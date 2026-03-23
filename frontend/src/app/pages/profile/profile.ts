import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule, Settings, Heart, Bookmark, MapPin, LogOut, ChevronRight, Star, Loader } from 'lucide-angular';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  readonly settings = Settings;
  readonly heart = Heart;
  readonly bookmark = Bookmark;
  readonly mapPin = MapPin;
  readonly logOut = LogOut;
  readonly chevronRight = ChevronRight;
  readonly star = Star;
  readonly loader = Loader;

  private authService = inject(AuthService);
  private router = inject(Router);

  loading = signal(true);
  isLoggedIn = signal(false);

  // Profile data with fallback defaults
  profile = signal({
    name: 'Guest User',
    initials: 'GU',
    memberSince: '2024',
    badge: 'Community Explorer',
    visited: 0,
    saved: 0,
    reviews: 0,
    pendingSubmissions: 0
  });
  ngOnInit() {
    const adminToken = this.authService.getToken();
    const userToken = this.authService.getUserToken();

    if (userToken || adminToken) {
      this.isLoggedIn.set(true);
      if (userToken) {
        try {
          const userStr = localStorage.getItem('user_data');
          if (userStr) {
            const user = JSON.parse(userStr);
            this.profile.set({
              name: user.full_name || user.name || user.email || 'Explorer',
              initials: this.getInitials(user.full_name || user.name || user.email || 'Explorer'),
              memberSince: '2024',
              badge: 'Local Explorer',
              visited: 12,
              saved: 5,
              reviews: 3,
              pendingSubmissions: 0
            });
          }
        } catch (e) {
          console.error('Audit [Profile]: User decode failure', e);
        }
      } else if (adminToken) {
        try {
          const adminStr = localStorage.getItem('admin_user');
          if (adminStr) {
            const admin = JSON.parse(adminStr);
            this.profile.set({
              name: admin.username || admin.name || 'Admin User',
              initials: this.getInitials(admin.username || admin.name || 'Admin User'),
              memberSince: '2024',
              badge: 'Community Contributor',
              visited: 23,
              saved: 15,
              reviews: 8,
              pendingSubmissions: 2
            });
          }
        } catch (e) {
          console.error('Audit [Profile]: Admin decode failure', e);
        }
      }
    } else {
      // If no session found, redirect to login so we don't show a "Guest User" profile
      this.router.navigate(['/login']);
    }
    this.loading.set(false);
  }

  getInitials(name: string): string {
    return name.split(' ').map(w => w.charAt(0)).join('').toUpperCase().slice(0, 2);
  }

  signOut() {
    console.log('Audit: Signing out from Profile...');
    this.authService.logout();
    this.authService.userLogout();
    
    // Explicit clearance as safety net
    localStorage.clear(); 
    
    this.isLoggedIn.set(false);
    this.router.navigate(['/login']).then(success => {
      if (success) console.log('Audit: Logout redirect success');
      else console.error('Audit: Logout redirect failed');
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
