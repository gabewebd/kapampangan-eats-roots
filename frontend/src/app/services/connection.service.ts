import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConnectionService {
  isOffline = signal(!navigator.onLine);

  constructor() {
    window.addEventListener('online', () => this.isOffline.set(false));
    window.addEventListener('offline', () => this.isOffline.set(true));
  }
}
