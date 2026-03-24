import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { importProvidersFrom, isDevMode } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { routes } from './app.routes';
import { LucideAngularModule, Home, Map, PlusCircle, User, Search, BadgeCheck, MapPin, Star, Utensils, Landmark, ArrowRight, Check, X, Bell, Activity, MoreHorizontal, LogOut, Lock, Loader, Facebook, Instagram, Twitter, Heart, Settings, Bookmark, Camera, Store, Clock, BookOpen, ShieldCheck, Sparkles, ChevronRight, Quote, Calendar, Eye, Info } from 'lucide-angular';
import { provideServiceWorker } from '@angular/service-worker';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withInMemoryScrolling({ 
      anchorScrolling: 'enabled',
      scrollPositionRestoration: 'enabled'
    })),
    provideHttpClient(withFetch()),
    importProvidersFrom(LucideAngularModule.pick({ Home, Map, PlusCircle, User, Search, BadgeCheck, MapPin, Star, Utensils, Landmark, ArrowRight, Check, X, Bell, Activity, MoreHorizontal, LogOut, Lock, Loader, Facebook, Instagram, Twitter, Heart, Settings, Bookmark, Camera, Store, Clock, BookOpen, ShieldCheck, Sparkles, ChevronRight, Quote, Calendar, Eye, Info })), provideServiceWorker('ngsw-worker.js', {
            enabled: !isDevMode(),
            registrationStrategy: 'registerWhenStable:30000'
          })
  ]
};
