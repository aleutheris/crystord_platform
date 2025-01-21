import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root',
})
export class AtomService {
  constructor(private http: HttpClient) { }

  retrieveAtomsFeatures(data: any): Observable<any> {
    return this.http.post(`/api/readouts`, data).pipe(
      catchError(error => {
        console.error('An error occurred while fetching atom content', error);
        return throwError(() => new Error('An error occurred while fetching atom content'));
      })
    );
  }

  updateAtomsFeatures(data: any): Observable<any> {
    return this.http.post(`/api/modifications`, data).pipe(
      catchError(error => {
        console.error('An error occurred while updating atom content', error);
        return throwError(() => new Error('An error occurred while updating atom content'));
      })
    );
  }
}
