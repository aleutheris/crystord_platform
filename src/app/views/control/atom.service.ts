import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Atom } from './atom.model';


@Injectable({
  providedIn: 'root',
})
export class AtomService {

  constructor(private http: HttpClient) { }

  getAtomContent(atomId: string): Observable<any> {
    return this.http.get(`/api/get_atom_content/${atomId}`).pipe(
      catchError(error => {
        console.error('An error occurred while fetching atom content', error);
        return throwError(() => new Error('An error occurred while fetching atom content'));
      })
    );
  }
}
