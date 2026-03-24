import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

function handleHttpError(context: string) {
  return (error: HttpErrorResponse) => {
    if (error.status === 0) {
      console.error(`Audit [Admin/${context}]: CORS or network error`, error);
    } else if (error.status === 401) {
      console.error(`Audit [Admin/${context}]: Unauthorized (401)`, error);
    } else if (error.status === 404) {
      console.error(`Audit [Admin/${context}]: Not found (404)`, error);
    } else if (error.status === 500) {
      console.error(`Audit [Admin/${context}]: Server error (500)`, error);
    } else {
      console.error(`Audit [Admin/${context}]: HTTP ${error.status}`, error);
    }
    return throwError(() => error);
  };
}

@Injectable({
    providedIn: 'root',
})
export class AdminService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/admin`;

    private getHeaders() {
        const token = localStorage.getItem('admin_token');
        return new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
    }

    getDashboardMetrics(): Observable<any> {
        return this.http.get(`${this.apiUrl}/metrics`, { headers: this.getHeaders() }).pipe(
            catchError(handleHttpError('Metrics'))
        );
    }

    getPendingVendors(): Observable<any> {
        return this.http.get(`${this.apiUrl}/vendors/pending`, { headers: this.getHeaders() }).pipe(
            catchError(handleHttpError('Pending'))
        );
    }

    approveVendor(id: string): Observable<any> {
        return this.http.put(`${this.apiUrl}/vendors/${id}/approve`, {}, { headers: this.getHeaders() }).pipe(
            catchError(handleHttpError('Approve'))
        );
    }

    rejectVendor(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/vendors/${id}/reject`, { headers: this.getHeaders() }).pipe(
            catchError(handleHttpError('Reject'))
        );
    }

    authenticateVendor(id: string, asfScores?: any): Observable<any> {
        const vendorUrl = `${environment.apiUrl}/vendors`;
        const body = asfScores ? { asfScores } : {};
        return this.http.patch(`${vendorUrl}/${id}/authenticate`, body, { headers: this.getHeaders() }).pipe(
            catchError(handleHttpError('Authenticate'))
        );
    }
}
