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
    const atoms = this.atomsSubject.getValue();
    return atoms.find(atom => atom.properties?.shellies?.uuid === uuid);
  }

  /**
   * Synchronously get current atoms array
   */
  getAtomsValue(): Atom[] {
    return this.atomsSubject.getValue();
  }

  /**
   * Update a single atom in the store by UUID
   */
  updateAtom(updatedAtom: Atom): void {
    const atoms = this.atomsSubject.getValue();
    const newAtoms = atoms.map(atom =>
      atom.properties.shellies.uuid === updatedAtom.properties.shellies.uuid
        ? updatedAtom
        : atom
    );
    this.atomsSubject.next(newAtoms);
  }

  /**
   * Remove an atom from the store by UUID
   */
  removeAtom(uuid: string): void {
    const atoms = this.atomsSubject.getValue();
    const newAtoms = atoms.filter(atom => atom.properties.shellies.uuid !== uuid);
    this.atomsSubject.next(newAtoms);
  }

  addBond(atomUuid: string, bondUuid: string, direction: 'to' | 'from', name = ''): void {
    const atoms = this.atomsSubject.getValue();
    let changed = false;

    const updatedAtoms = atoms.map(atom => {
      if (atom.properties.shellies.uuid !== atomUuid) {
        return atom;
      }

      const bonds = atom.bonds ?? [];
      const alreadyExists = bonds.some(
        bond => bond.uuid === bondUuid && bond.direction === direction
      );
      if (alreadyExists) {
        return atom;
      }

      changed = true;
      return {
        ...atom,
        bonds: [...bonds, { uuid: bondUuid, name, direction }]
      };
    });

    if (changed) {
      this.atomsSubject.next(updatedAtoms);
    }
  }

  removeBond(atomUuid: string, bondUuid: string, direction?: 'to' | 'from'): boolean {
    const atoms = this.atomsSubject.getValue();
    let changed = false;

    const updatedAtoms = atoms.map(atom => {
      if (atom.properties.shellies.uuid !== atomUuid) {
        return atom;
      }

      const bonds = atom.bonds ?? [];
      const filtered = bonds.filter(bond => {
        const uuidMatches = bond.uuid === bondUuid;
        const directionMatches = direction ? bond.direction === direction : true;
        return !(uuidMatches && directionMatches);
      });

      if (filtered.length === bonds.length) {
        return atom;
      }

      changed = true;
      return {
        ...atom,
        bonds: filtered
      };
    });

    if (changed) {
      this.atomsSubject.next(updatedAtoms);
      return true;
    }
    return false;
  }
}
