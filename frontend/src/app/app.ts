import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterModule, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BottomNavComponent } from './components/shared/bottom-nav/bottom-nav';
import { Footer } from './components/shared/footer/footer';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AuthService } from './services/auth';
import { LucideAngularModule, User, LogIn } from 'lucide-angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule, BottomNavComponent, Footer, LucideAngularModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {
  protected readonly title = signal('frontend');
  showNav = signal(true);
  
  // Expose icons for template
  readonly userIcon = User;
  readonly logInIcon = LogIn;

  private router = inject(Router);
  public authService = inject(AuthService); // Inject AuthService for template access
  private routerSub!: Subscription;

  get isUserLoggedIn(): boolean {
    return this.authService.isUserLoggedIn();
  }

  ngOnInit() {
    this.routerSub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url = event.urlAfterRedirects || event.url;
      const isAdminRoute = url.startsWith('/admin');
      this.showNav.set(!isAdminRoute);
    });
  }

  ngOnDestroy() {
    this.routerSub?.unsubscribe();
  }
}
