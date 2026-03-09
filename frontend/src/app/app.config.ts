import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { routes } from './app.routes';
import { LucideAngularModule, Home, Map, PlusCircle, User, Search, BadgeCheck, MapPin, Star, Utensils, Landmark, ArrowRight, Check, X, Bell, Activity, MoreHorizontal, LogOut, Lock, Loader } from 'lucide-angular';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withFetch()),
    importProvidersFrom(LucideAngularModule.pick({ Home, Map, PlusCircle, User, Search, BadgeCheck, MapPin, Star, Utensils, Landmark, ArrowRight, Check, X, Bell, Activity, MoreHorizontal, LogOut, Lock, Loader }))
  ]
};
