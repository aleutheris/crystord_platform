import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';


@Injectable({
  providedIn: 'root',
})
export class ComService {
  constructor(private http: HttpClient) { }

  modifyAtoms(data: any): Observable<any> {
    return this.http.post(`/api/modifications`, data).pipe(
      catchError(error => {
        console.error('An error occurred while updating findata readouts', error);
        return throwError(() => new Error('An error occurred while updating findata readouts'));
      })
    );
  }

  readAtoms(data: any): Observable<any> {
    return this.http.post(`/api/readouts`, data).pipe(
      catchError(error => {
        console.error('An error occurred while get findata readouts', error);
        return throwError(() => new Error('An error occurred while get findata readouts'));
      })
    );
  }
}
