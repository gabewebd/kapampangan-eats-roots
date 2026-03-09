import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5000/api/auth';

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((res: any) => {
        // Save token to protect the single-page admin view
        if (res.token) localStorage.setItem('admin_token', res.token);
      })
    );
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('admin_token');
  }

  logout() {
    localStorage.removeItem('admin_token');
  }
}