import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/auth`;

  login(credentials: { username: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/login`, credentials).pipe(
      tap((res: any) => {
        if (res.token) {
          localStorage.setItem('admin_token', res.token);
          localStorage.setItem('admin_user', JSON.stringify(res.admin));
        }
      }),
      catchError(this.handleError('Admin Login'))
    );
  }

  userLogin(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/user-login`, credentials).pipe(
      tap((res: any) => {
        if (res.token) {
          localStorage.setItem('user_token', res.token);
          localStorage.setItem('user_data', JSON.stringify(res.user));
        }
      }),
      catchError(this.handleError('User Login'))
    );
  }

  userRegister(userData: { name: string, email: string, password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/user-register`, userData).pipe(
      tap((res: any) => {
        if (res.token) {
          localStorage.setItem('user_token', res.token);
          localStorage.setItem('user_data', JSON.stringify(res.user));
        }
      }),
      catchError(this.handleError('User Register'))
    );
  }

  private handleError(context: string) {
    return (error: HttpErrorResponse) => {
      if (error.status === 0) {
        console.error(`Audit [${context}]: CORS or network error`, error);
      } else if (error.status === 404) {
        console.error(`Audit [${context}]: Not found (404)`, error);
      } else if (error.status === 400) {
        console.error(`Audit [${context}]: Invalid credentials (400)`, error);
      } else {
        console.error(`Audit [${context}]: HTTP ${error.status}`, error);
      }
      return throwError(() => error);
    };
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('admin_token');
  }

  isUserLoggedIn(): boolean {
    return !!localStorage.getItem('user_token');
  }

  logout() {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
  }

  userLogout() {
    localStorage.removeItem('user_token');
    localStorage.removeItem('user_data');
  }

  getToken() {
    return localStorage.getItem('admin_token');
  }

  getUserToken() {
    return localStorage.getItem('user_token');
  }
}
