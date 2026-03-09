import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class AdminService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:5000/api/admin';

    private getHeaders() {
        const token = localStorage.getItem('admin_token');
        return new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
    }

    getDashboardMetrics(): Observable<any> {
        return this.http.get(`${this.apiUrl}/metrics`, { headers: this.getHeaders() });
    }

    getPendingVendors(): Observable<any> {
        return this.http.get(`${this.apiUrl}/vendors/pending`, { headers: this.getHeaders() });
    }

    approveVendor(id: string): Observable<any> {
        return this.http.put(`${this.apiUrl}/vendors/${id}/approve`, {}, { headers: this.getHeaders() });
    }

    rejectVendor(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/vendors/${id}/reject`, { headers: this.getHeaders() });
    }
}
