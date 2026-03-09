import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5000/api/auth';

  login(credentials: { username: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((res: any) => {
        if (res.token) {
          localStorage.setItem('admin_token', res.token);
          localStorage.setItem('admin_user', JSON.stringify(res.admin));
        }
      })
    );
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('admin_token');
  }

  logout() {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
  }

  getToken() {
    return localStorage.getItem('admin_token');
  }
}