import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { LucideAngularModule, Pencil, Heart, Bookmark, MapPin, LogOut, ChevronRight, Star, Loader, X, Check, Quote } from 'lucide-angular';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  readonly pencil = Pencil;
  readonly heart = Heart;
  readonly bookmark = Bookmark;
  readonly mapPin = MapPin;
  readonly logOut = LogOut;
  readonly chevronRight = ChevronRight;
  readonly star = Star;
  readonly loader = Loader;
  readonly xIcon = X;
  readonly check = Check;
  readonly quote = Quote;

  private authService = inject(AuthService);
  private userService = inject(UserService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

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
    id: '',
    name: 'Guest User',
    initials: 'GU',
    bio: 'Local Explorer',
    memberSince: '2024',
    badge: 'Community Explorer',
    visited: 0,
    saved: 0,
    favorites: 0,
    reviews: 0,
    pendingSubmissions: 0
  });

  isEditModalOpen = signal(false);
  editForm!: FormGroup;
  isSaving = signal(false);
  initEditForm() {
    this.editForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      bio: ['', [Validators.maxLength(150)]]
    });
  }

  ngOnInit() {
    this.initEditForm();
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
                    id: fullUser._id,
                    name: fullUser.name || fullUser.email || 'Explorer',
                    initials: this.getInitials(fullUser.name || fullUser.email || 'Explorer'),
                    bio: fullUser.bio || 'Local Explorer',
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
              id: admin.id || admin._id || 'admin',
              name: admin.username || admin.name || 'Admin User',
              initials: this.getInitials(admin.username || admin.name || 'Admin User'),
              bio: 'System Administrator',
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

  openEditModal() {
    this.editForm.patchValue({
      name: this.profile().name,
      bio: this.profile().bio
    });
    this.isEditModalOpen.set(true);
  }

  closeEditModal() {
    this.isEditModalOpen.set(false);
  }

  saveProfile() {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    const userId = this.profile().id;
    const updateData = this.editForm.value;

    this.userService.updateProfile(userId, updateData).subscribe({
      next: (res) => {
        if (res.success) {
          // Update local signal
          this.profile.update(p => ({
            ...p,
            name: updateData.name,
            initials: this.getInitials(updateData.name),
            bio: updateData.bio
          }));
          
          // If we have local user_data, update it too if name changed
          const userStr = localStorage.getItem('user_data');
          if (userStr) {
            const user = JSON.parse(userStr);
            user.name = updateData.name;
            localStorage.setItem('user_data', JSON.stringify(user));
          }
          
          this.closeEditModal();
        }
        this.isSaving.set(false);
      },
      error: (err) => {
        console.error('Audit [Profile]: Update failed', err);
        this.isSaving.set(false);
        alert('Failed to update profile. Please try again.');
      }
    });
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
