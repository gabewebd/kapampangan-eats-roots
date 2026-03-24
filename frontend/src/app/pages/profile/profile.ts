import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { LucideAngularModule, Settings, Heart, Bookmark, MapPin, LogOut, ChevronRight, Star, Loader } from 'lucide-angular';
import { AuthService } from '../../services/auth';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, RouterModule],
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
  private userService = inject(UserService);
  private router = inject(Router);

  loading = signal(true);
  isLoggedIn = signal(false);
  activeTab = signal<'none' | 'favorites' | 'saved' | 'submissions' | 'visited'>('none');
  
  // Store full list data
  favorites = signal<any[]>([]);
  savedPlaces = signal<any[]>([]);
  submissions = signal<any[]>([]);
  visitedPlaces = signal<any[]>([]);

  // Profile data with fallback defaults
  profile = signal({
    name: 'Guest User',
    initials: 'GU',
    memberSince: '2024',
    badge: 'Community Explorer',
    visited: 0,
    saved: 0,
    favorites: 0,
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
            this.userService.getProfile(user.id || user._id).subscribe({
              next: (fullUser: any) => {
                if (fullUser) {
                  this.profile.set({
                    name: fullUser.name || fullUser.email || 'Explorer',
                    initials: this.getInitials(fullUser.name || fullUser.email || 'Explorer'),
                    memberSince: new Date(fullUser.memberSince).getFullYear().toString() || '2024',
                    badge: 'Local Explorer',
                    visited: fullUser.visited?.length || 0,
                    saved: fullUser.savedPlaces?.length || 0,
                    favorites: fullUser.favorites?.length || 0,
                    reviews: 0,
                    pendingSubmissions: fullUser.submissions?.filter((s: any) => !s.isVerified).length || 0
                  });
                  this.favorites.set(fullUser.favorites || []);
                  this.savedPlaces.set(fullUser.savedPlaces || []);
                  this.submissions.set(fullUser.submissions || []);
                  this.visitedPlaces.set(fullUser.visited || []);
                }
                this.loading.set(false);
              },
              error: (err) => {
                console.error('Audit [Profile]: Fetch failed', err);
                this.loading.set(false);
              }
            });
            return; // Exit early as we are loading async
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
              visited: 0,
              saved: 0,
              favorites: 0,
              reviews: 0,
              pendingSubmissions: 0
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

  setActiveTab(tab: 'none' | 'favorites' | 'saved' | 'submissions' | 'visited') {
    if (this.activeTab() === tab) {
      this.activeTab.set('none'); // Toggle off
    } else {
      this.activeTab.set(tab);
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
