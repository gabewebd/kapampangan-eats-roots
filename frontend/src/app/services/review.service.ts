import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Review {
  _id?: string;
  vendorId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/reviews`;

  getReviews(vendorId: string): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/${vendorId}`);
  }

  addReview(vendorId: string, review: Review): Observable<Review> {
    return this.http.post<Review>(`${this.apiUrl}/${vendorId}`, review);
  }
}
