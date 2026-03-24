import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Vendor {
  _id: string;
  name: string;
  yearsInOperation: string;
  category: 'Local Eatery' | 'Heritage Site';
  culturalStory: string;
  location: {
    address: string;
    coordinates?: { lat: number; lng: number };
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
      catchError(handleHttpError('Trending'))
    );
  }

  getVendorById(id: string): Observable<Vendor> {
    return this.http.get<Vendor>(`${this.apiUrl}/${id}`).pipe(
      catchError(handleHttpError(`Vendor ${id}`))
    );
  }

  getHeritageSites(): Observable<Vendor[]> {
    return this.http.get<Vendor[]>(`${this.apiUrl}/filter/heritage`).pipe(
      catchError(handleHttpError('Heritage Sites'))
    );
  }

  getEateries(): Observable<Vendor[]> {
    return this.http.get<Vendor[]>(`${this.apiUrl}/filter/eateries`).pipe(
      catchError(handleHttpError('Eateries'))
    );
  }

  getAllForMap(): Observable<Partial<Vendor>[]> {
    return this.http.get<Partial<Vendor>[]>(`${this.apiUrl}/explore/map`).pipe(
      catchError(handleHttpError('Map Data'))
    );
  }

  getRelatedVendors(id: string): Observable<Vendor[]> {
    return this.http.get<Vendor[]>(`${this.apiUrl}/${id}/related`).pipe(
      catchError(handleHttpError(`Related Vendors ${id}`))
    );
  }
  
  search(query: string): Observable<Vendor[]> {
    return this.http.get<Vendor[]>(`${this.apiUrl}/search?q=${query}`).pipe(
      catchError(handleHttpError('Search'))
    );
  }
}
