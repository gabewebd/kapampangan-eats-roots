import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError, retry, timer } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Vendor {
  _id: string;
  name: string;
  yearsInOperation: string;
  category: 'Local Eatery' | 'Heritage Site';
  culturalStory: string;
  location: {
    address: string;
    type?: string;
    coordinates: [number, number] | { lat: number, lng: number }; // [lng, lat] or {lat, lng}
  };
  images: string[];
  authenticityTraits: string[];
  menuHighlights: {
    name: string;
    description: string;
    price: number;
    image: string;
  }[];
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  isAuthentic: boolean;
  asfScores?: {
    historicalContinuity: number;
    culturalAuthenticity: number;
    communityRelevance: number;
    heritageDocumentation: number;
    digitalNarrativeQuality: number;
    totalScore: number;
  };
  historicalSignificance?: string;
  yearEstablished?: string;
  createdAt: string;
}

function handleHttpError(context: string) {
  return (error: HttpErrorResponse) => {
    if (error.status === 0) {
      console.error(`Audit [${context}]: CORS or network error — server may be unreachable`, error);
    } else if (error.status === 404) {
      console.error(`Audit [${context}]: Resource not found (404)`, error);
    } else if (error.status === 500) {
      console.error(`Audit [${context}]: Internal server error (500)`, error);
    } else {
      console.error(`Audit [${context}]: HTTP ${error.status}`, error);
    }
    return throwError(() => error);
  };
}

@Injectable({
  providedIn: 'root',
})
export class VendorService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/vendors`;

  getTrending(): Observable<Vendor[]> {
    return this.http.get<Vendor[]>(`${this.apiUrl}/trending`).pipe(
      retry({ count: 1, delay: () => timer(1000) }),
      catchError(handleHttpError('Trending'))
    );
  }

  getVendorById(id: string): Observable<Vendor> {
    return this.http.get<Vendor>(`${this.apiUrl}/${id}`).pipe(
      retry({ count: 1, delay: () => timer(1000) }),
      catchError(handleHttpError(`Vendor ${id}`))
    );
  }

  getHeritageSites(): Observable<Vendor[]> {
    return this.http.get<Vendor[]>(`${this.apiUrl}/filter/heritage`).pipe(
      retry({ count: 1, delay: () => timer(1000) }),
      catchError(handleHttpError('Heritage Sites'))
    );
  }

  getEateries(): Observable<Vendor[]> {
    return this.http.get<Vendor[]>(`${this.apiUrl}/filter/eateries`).pipe(
      retry({ count: 1, delay: () => timer(1000) }),
      catchError(handleHttpError('Eateries'))
    );
  }

  getAllForMap(): Observable<Partial<Vendor>[]> {
    return this.http.get<Partial<Vendor>[]>(`${this.apiUrl}/explore/map`).pipe(
      retry({ count: 1, delay: () => timer(1000) }),
      catchError(handleHttpError('Map Data'))
    );
  }

  getRelatedVendors(id: string): Observable<Vendor[]> {
    return this.http.get<Vendor[]>(`${this.apiUrl}/${id}/related`).pipe(
      retry({ count: 1, delay: () => timer(1000) }),
      catchError(handleHttpError(`Related Vendors ${id}`))
    );
  }

  search(query: string): Observable<Vendor[]> {
    return this.http.get<Vendor[]>(`${this.apiUrl}/search?q=${query}`).pipe(
      retry({ count: 1, delay: () => timer(1000) }),
      catchError(handleHttpError('Search'))
    );
  }
}
