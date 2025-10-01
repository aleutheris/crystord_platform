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
  console.log('[AtomStoreService] setAtoms called with:', atoms);
  this.atomsSubject.next(atoms);
  console.log('[AtomStoreService] atomsSubject now contains:', this.atomsSubject.getValue());
  }

  /**
   * Get all atoms as observable
   */
  getAtoms$(): Observable<Atom[]> {
  console.log('[AtomStoreService] getAtoms$ called. Current atoms:', this.atomsSubject.getValue());
  return this.atomsSubject.asObservable();
  }

  /**
   * Get atom by UUID
   */
  getAtomByUuid(uuid: string): Atom | undefined {
  const atoms = this.atomsSubject.getValue();
  const found = atoms.find(atom => atom.properties?.shellies?.uuid === uuid);
  console.log(`[AtomStoreService] getAtomByUuid called for uuid: ${uuid}. Found:`, found);
  return found;
  }
  /**
   * Synchronously get current atoms array
   */
  getAtomsValue(): Atom[] {
    const atoms = this.atomsSubject.getValue();
    console.log('[AtomStoreService] getAtomsValue():', atoms);
    return atoms;
  }
}
