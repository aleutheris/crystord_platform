import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AtomSelectionService {
  private selectedUuidSubject = new BehaviorSubject<string | null>(null);

  /**
   * Set the selected atom UUID
   */
  selectAtom(uuid: string | null): void {
    this.selectedUuidSubject.next(uuid);
  }

  /**
   * Get the selected atom UUID as observable
   */
  getSelectedUuid$(): Observable<string | null> {
    return this.selectedUuidSubject.asObservable();
  }

  /**
   * Get the currently selected atom UUID (sync)
   */
  getSelectedUuid(): string | null {
    return this.selectedUuidSubject.getValue();
  }
}
