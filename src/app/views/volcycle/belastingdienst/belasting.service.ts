import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root',
})
export class BelastingService {
  constructor(private http: HttpClient) { }

  getBelastingTable(data: any): Observable<any> {
    return this.http.post(`/api/readouts`, data).pipe(
      catchError(error => {
        console.error('An error occurred while searching belasting', error);
        return throwError(() => new Error('An error occurred while searching belasting'));
      })
    );
  }

  getPreBelastingTable(data: any): Observable<any> {
    return this.http.post(`/api/readouts`, data).pipe(
      catchError(error => {
        console.error('An error occurred while get prebelasting readouts', error);
        return throwError(() => new Error('An error occurred while get prebelasting readouts'));
      })
    );
  }
}
