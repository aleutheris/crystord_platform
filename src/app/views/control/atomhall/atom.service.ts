import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Apollo, gql } from 'apollo-angular';
import { Atom } from './atom.model';


@Injectable({
  providedIn: 'root',
})
export class AtomService {
  constructor(private apollo: Apollo) { }

  // GraphQL: retrieve(labels, uuid)
  readAtoms(data: any): Observable<any> {
    const { labels, uuid } = this.extractSelector(data);
    const RETRIEVE = gql`
      query Retrieve($labels: [String], $uuid: String) {
        retrieve(labels: $labels, uuid: $uuid) {
          labels
          bonds { uuid name direction }
          properties {
            shellies { uuid changes { date description } }
            # Narrow nuclearies selection to fields known to resolve without server errors.
            # "constants" previously triggered "Expected Iterable" errors; likely a list type with non-iterable resolver value.
            # We omit description/operation/constants for now, matching the working playground example (title, content).
            nuclearies { title content }
          }
        }
      }
    `;
    return this.apollo.query({ query: RETRIEVE, variables: { labels, uuid }, fetchPolicy: 'no-cache', errorPolicy: 'all' }).pipe(
      map((res: any) => {
        // Normalize GraphQL shape to legacy REST-like `{ result: Atom[] }`
        const payload = res?.data?.retrieve;
        const raw = Array.isArray(payload) ? payload : (payload ? [payload] : []);
        const result: Atom[] = raw.map((r: any) => this.normalizeAtom(r));
        return { result };
      }),
      catchError(error => {
        console.error('An error occurred while fetching atom content', error);
        return throwError(() => new Error('An error occurred while fetching atom content'));
      })
    );
  }

  // GraphQL: change(selector, inputs) or destroy(selector)
  modifyAtoms(data: any): Observable<any> {
    const mod = data?.modification;
    if (mod === 'destroy_atoms' || mod === 'destroy') {
      const selector = this.extractSelector({ args: data.args });
      const DESTROY = gql`
        mutation Destroy($selector: Selector!) {
          destroy(selector: $selector)
        }
      `;
      return this.apollo.mutate({ mutation: DESTROY, variables: { selector } }).pipe(
        map((res: any) => ({ result: res?.data?.destroy })),
        catchError(error => {
          console.error('An error occurred while destroying atoms', error);
          return throwError(() => new Error('An error occurred while destroying atoms'));
        })
      );
    }

    // default to 'change' mutation
    const selector = this.extractSelector({ args: data.args });
    const inputs = this.extractInputs(data.args?.inputs);

    const CHANGE = gql`
      mutation Change($selector: Selector, $inputs: [AtomInput]!) {
        change(selector: $selector, inputs: $inputs)
      }
    `;
    return this.apollo.mutate({ mutation: CHANGE, variables: { selector, inputs } }).pipe(
      map((res: any) => ({ result: res?.data?.change })),
      catchError(error => {
        console.error('An error occurred while updating atom content', error);
        return throwError(() => new Error('An error occurred while updating atom content'));
      })
    );
  }

  private extractSelector(data: any): { labels?: string[]; uuid?: string } {
    if (data.uuid) {
      return { uuid: data.uuid };
    }
    const selector = data?.args?.selector || data?.selector || {};
    const labels = selector.labels || selector?.properties?.labels || undefined;
    const uuid = selector?.properties?.shellies?.uuid || selector.uuid || undefined;
    return { labels, uuid };
  }

  private extractInputs(inputs: any): any[] {
    if (!inputs) return [];
    // The app currently passes an array of atoms for form_atoms, or a single object for update.
    const toArray = Array.isArray(inputs) ? inputs : [inputs];
    // Map to GraphQL AtomInput structure; here we pass through assuming shape compatibility.
    return toArray as any[];
  }

  private normalizeAtom(raw: any): Atom {
    // Map GraphQL fields to legacy Atom shape
    const shellies = raw.properties?.shellies || {};
    const nuclearies = raw.properties?.nuclearies || {};
    // Handle constants defensively: ensure array -> string join, else empty string.
    const constantsValue = Array.isArray(nuclearies.constants)
      ? (nuclearies.constants as any[]).join(', ')
      : (typeof nuclearies.constants === 'string' ? nuclearies.constants : '');
    return {
      labels: raw.labels || [],
      bonds: (raw.bonds || []).map((b: any) => ({ uuid: b.uuid, name: b.name, direction: b.direction })),
      properties: {
        shellies: {
          uuid: shellies.uuid || '',
          changeHistory: shellies.changes || []
        },
        nuclearies: {
          title: nuclearies.title || '',
          description: nuclearies.description || '', // omitted from query currently; fallback empty
          content: nuclearies.content || '',
          constants: constantsValue,
          operation: nuclearies.operation || '' // omitted from query currently; fallback empty
        },
        ionies: {}
      }
    };
  }
}
