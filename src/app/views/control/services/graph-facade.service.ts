import { Injectable } from '@angular/core';
import { combineLatest, map, Observable } from 'rxjs';
import { Atom } from '../atomhall/atom.model';
import { AtomService } from '../atomhall/atom.service';
import { AtomSelectionService } from './atom-selection.service';
import { AtomStoreService } from './atom-store.service';

@Injectable({ providedIn: 'root' })
export class GraphFacadeService {
  constructor(
    private atomService: AtomService,
    private atomSelection: AtomSelectionService,
    private atomStore: AtomStoreService
  ) {}

  /**
   * Emits the currently selected Atom from the store, or null if none is selected.
   */
  selectedAtom$(): Observable<Atom | null> {
    return combineLatest([
      this.atomSelection.getSelectedUuid$(),
      this.atomStore.getAtoms$()
    ]).pipe(
      map(([uuid, _atoms]) => {
        if (!uuid) return null;
        return this.atomStore.getAtomByUuid(uuid) ?? null;
      })
    );
  }

  /**
   * Updates an atom locally in the store (used while editing form fields).
   */
  updateLocalAtom(atom: Atom): void {
    this.atomStore.updateAtom(atom);
  }

  /**
   * Load atom features by UUID from backend.
   */
  loadAtom(uuid: string) {
    const rq = {
      readout: 'retrieve_atom_features_nested',
      args: {
        selector: {
          properties: {
            shellies: { uuid }
          }
        }
      }
    } as const;

    return this.atomService.readAtoms(rq);
  }

  /**
   * Persist updated atom features to backend.
   */
  updateAtomFeatures(atom: Atom) {
    const mq = {
      modification: 'update_atom_features',
      args: {
        selector: {
          properties: {
            shellies: { uuid: atom.properties.shellies.uuid }
          }
        },
        inputs: {
          labels: atom.labels,
          properties: {
            nuclearies: {
              title: atom.properties.nuclearies.title,
              description: atom.properties.nuclearies.description,
              content: this.str2json(atom.properties.nuclearies.content),
              constants: atom.properties.nuclearies.constants,
              operation: this.str2json(atom.properties.nuclearies.operation)
            }
          }
        }
      }
    } as const;

    return this.atomService.modifyAtoms(mq);
  }

  /**
   * Destroy atom by UUID.
   */
  destroyAtom(uuid: string) {
    const mq = {
      modification: 'destroy_atoms',
      args: {
        selector: {
          properties: {
            shellies: { uuid }
          }
        }
      }
    } as const;

    return this.atomService.modifyAtoms(mq);
  }

  private str2json(value: any) {
    let result = value;
    if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
      try {
        result = JSON.parse(value);
      } catch {
        // keep original string if JSON parse fails
      }
    }
    return result;
  }
}
