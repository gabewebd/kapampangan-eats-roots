import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { ExploreMap } from './pages/explore-map/explore-map';
import { SubmitListing } from './pages/submit-listing/submit-listing';
import { Profile } from './pages/profile/profile';
import { AdminLogin } from './pages/admin-login/admin-login';
import { AdminDashboard } from './pages/admin-dashboard/admin-dashboard';
import { VendorDetail } from './pages/vendor-detail/vendor-detail';
import { UserLogin } from './pages/user-login/user-login';
import { PrivacyPolicy } from './pages/privacy-policy/privacy-policy';
import { TermsOfService } from './pages/terms-of-service/terms-of-service';
import { Guidelines } from './pages/guidelines/guidelines';
import { VerifiedProgram } from './pages/verified-program/verified-program';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'explore', component: ExploreMap },
  { path: 'submit', component: SubmitListing },
  { path: 'profile', component: Profile },
  { path: 'profile/:id', component: Profile },
  { path: 'login', component: UserLogin },
  { path: 'admin-login', component: AdminLogin },
  { path: 'admin-dashboard', component: AdminDashboard, canActivate: [authGuard] },
  { path: 'vendor-detail/:id', component: VendorDetail },
  { path: 'privacy-policy', component: PrivacyPolicy },
  { path: 'terms-of-service', component: TermsOfService },
  { path: 'guidelines', component: Guidelines },
  { path: 'verified-program', component: VerifiedProgram }
];
