import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';


@Injectable({
  providedIn: 'root',
})
export class AtomService {
  constructor(private http: HttpClient) { }

  getAllAtomFeatures(data: any): Observable<any> {
    return this.http.get(`/api/get_atom_all_features/${data}`).pipe(
      catchError(error => {
        console.error('An error occurred while fetching atom content', error);
        return throwError(() => new Error('An error occurred while fetching atom content'));
      })
    );
  }

  updateAtomNuclearies(data: any): Observable<any> {
    return this.http.put(`/api/update_atom_scalar_nuclearies`, data).pipe(
      catchError(error => {
        console.error('An error occurred while updating atom content', error);
        return throwError(() => new Error('An error occurred while updating atom content'));
      })
    );
  }
}
