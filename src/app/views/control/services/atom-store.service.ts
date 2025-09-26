import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Atom } from '../atomhall/atom.model';

@Injectable({ providedIn: 'root' })
export class AtomStoreService {
  private atomsSubject = new BehaviorSubject<Atom[]>([]);

  /**
   * Update the atom store with a new list of atoms
   */
  setAtoms(atoms: Atom[]): void {
    this.atomsSubject.next(atoms);
  }

  /**
   * Get all atoms as observable
   */
  getAtoms$(): Observable<Atom[]> {
    return this.atomsSubject.asObservable();
  }

  /**
   * Get atom by UUID
   */
  getAtomByUuid(uuid: string): Atom | undefined {
    return this.atomsSubject.getValue().find(atom => atom.properties?.shellies?.uuid === uuid);
  }
}
