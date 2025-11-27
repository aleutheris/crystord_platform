import { Component, Input, Output, EventEmitter, ContentChild, TemplateRef, AfterContentInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconDirective } from '@coreui/icons-angular';
import {
  SidebarComponent,
  SidebarHeaderComponent,
  SidebarFooterComponent,
  SidebarToggleDirective,
  ButtonDirective,
  FormControlDirective,
  InputGroupComponent,
  InputGroupTextDirective,
  DropdownComponent,
  DropdownToggleDirective,
  DropdownMenuDirective,
  DropdownItemDirective
} from '@coreui/angular';
import { Atom } from '../../atomhall/atom.model';
import { AtomService } from '../../atomhall/atom.service';
import { AtomSelectionService } from '../../services/atom-selection.service';
import { AtomStoreService } from '../../services/atom-store.service';

export interface GraphSidebarConfig {
  width: {
    expanded: string;
    narrow: string;
  };
  defaultExpanded: boolean;
  title: string;
}

@Component({
  selector: 'app-graph-right-sidebar',
  templateUrl: './graph-right-sidebar.component.html',
  styleUrls: ['./graph-right-sidebar.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SidebarComponent,
    SidebarHeaderComponent,
    SidebarFooterComponent,
    SidebarToggleDirective,
    ButtonDirective,
    IconDirective,
    FormControlDirective,
    InputGroupComponent,
    InputGroupTextDirective,
    DropdownComponent,
    DropdownToggleDirective,
    DropdownMenuDirective,
    DropdownItemDirective
  ]
})
export class GraphRightSidebarComponent implements AfterContentInit {
  @Input() config: GraphSidebarConfig = {
    width: {
      expanded: '600px',
      narrow: '60px'
    },
    defaultExpanded: true,
    title: 'Atom Features'
  };

  @Input() visible: boolean = true;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() toggleEvent = new EventEmitter<boolean>();
  @Output() atomUpdated = new EventEmitter<Atom>();
  @Output() atomCreated = new EventEmitter<Atom>();
  @Output() atomDeleted = new EventEmitter<string>();

  @ContentChild(TemplateRef) contentTemplate!: TemplateRef<any>;
  @ViewChild('operationInput') operationInput?: ElementRef<HTMLInputElement>;

  isExpanded: boolean = true;
  hasProjectedContent: boolean = false;

  // Atom update properties
  atomForUpdate: Atom = this.initializeUpdateAtom();
  originalAtomState: Atom | null = null;
  private isUpdatingFromBlur: boolean = false;

  // Helper method to get constants as string for template
  getConstantsAsString(): string {
    const constants = this.atomForUpdate.properties.nuclearies.constants;
    return typeof constants === 'string' ? constants : (typeof constants === 'object' ? JSON.stringify(constants) : '');
  }

  // Operation type dropdown
  selectedOperationType: string = '';

  // Label input buffer
  labelInputValue: string = '';

  // Selected atom UUID
  selectedAtomUuid: string | null = null;

  // Operation field state
  isOperationFieldFocused: boolean = false;
  isOperationValid: boolean = true;
  parsedOperationTokens: Array<{type: 'uuid' | 'operator', value: string, title?: string}> = [];

  constructor(
    private atomService: AtomService,
    private atomSelection: AtomSelectionService,
    private atomStore: AtomStoreService
  ) {
    // Subscribe to selection changes
    this.atomSelection.getSelectedUuid$().subscribe(uuid => {
      this.selectedAtomUuid = uuid;
      if (uuid) {
        const atom = this.atomStore.getAtomByUuid(uuid);
        if (atom) {
          this.prepareAtomForUpdate(atom);
        } else {
          // If not in store, fetch from backend
          this.retrieveAtomFeatures(uuid);
        }
      } else {
        this.prepareAtomForUpdate(null);
      }
    });

    this.atomStore.getAtoms$().subscribe(() => {
      // Don't reload if we're currently updating or no atom selected
      if (!this.selectedAtomUuid || this.isUpdatingFromBlur) {
        return;
      }

      const atom = this.atomStore.getAtomByUuid(this.selectedAtomUuid);
      this.prepareAtomForUpdate(atom ?? null);
    });
  }

  ngOnInit() {
    this.isExpanded = this.config.defaultExpanded;
  }

  ngAfterContentInit() {
    this.hasProjectedContent = !!this.contentTemplate;
  }

  /**
   * Initialize an atom for update with default structure (copied from detail component)
   */
  private initializeUpdateAtom(): Atom {
    return {
      labels: [],
      bonds: [],
      properties: {
        shellies: {
          uuid: '',
          changeHistory: []
        },
        nuclearies: {
          title: '',
          description: '',
          content: '',
          constants: {},
          operation: ''
        },
        ionies: {}
      }
    };
  }

  toggleSidebar() {
    this.isExpanded = !this.isExpanded;
    this.toggleEvent.emit(this.isExpanded);
  }

  closeSidebar() {
    this.visible = false;
    this.visibleChange.emit(this.visible);
  }

  get currentWidth(): string {
    return this.isExpanded ? this.config.width.expanded : this.config.width.narrow;
  }

  /**
   * Notify store when atom properties change
   */
  onAtomPropertyChanged(): void {
    this.markAsDirty();
  }

  /**
   * Mark the atom as dirty and update the store
   */
  private markAsDirty(): void {
    this.atomForUpdate.isDirty = true;
    if (this.atomForUpdate.properties.shellies.uuid) {
      this.atomStore.updateAtom(this.atomForUpdate);
    }
  }

  /**
   * Save the atom (create or update)
   */
  saveAtom(): void {
    console.log('[Operation] saveAtom called');

    // Only update if there is at least one label
    if (this.atomForUpdate.labels.length === 0) {
      console.log('[Operation] No labels, skipping update');
      return;
    }

    // If no UUID, create new atom
    if (!this.atomForUpdate.properties.shellies.uuid) {
      this.createAtom();
      return;
    }

    // Otherwise update existing atom
    this.updateAtom();
  }

  private createAtom(): void {
    if (!this.canSaveAtom()) {
      return;
    }

    // Prepare the atom input for the mutation
    const atomInput = {
      labels: this.atomForUpdate.labels,
      properties: {
        nuclearies: {
          title: this.atomForUpdate.properties.nuclearies.title,
          description: this.atomForUpdate.properties.nuclearies.description,
          content: this.atomForUpdate.properties.nuclearies.content,
          operation: this.atomForUpdate.properties.nuclearies.operation,
          constants: this.atomForUpdate.properties.nuclearies.constants
        }
      }
    };

    // Call the change mutation without selector to create new atom
    const mq = {
      args: {
        inputs: [atomInput]
      }
    };

    this.atomService.modifyAtoms(mq).subscribe({
      next: (data) => {
        console.log('New atom created successfully:', data);
        // The response should contain the new UUID
        if (data.result && data.result.length > 0) {
          const newUuid = data.result[0];
          // Fetch the newly created atom to get complete data
          this.fetchAndIntegrateNewAtom(newUuid);
        }
      },
      error: (error) => {
        console.error('There was an error creating the new atom:', error);
      }
    });
  }

  private updateAtom(): void {
    console.log('[Operation] Preparing mutation with bonds:', this.atomForUpdate.bonds.length);
    let mq: {
      modification: string,
      args: {
        selector: {
          properties: {
            shellies: {
              uuid: string
            }
          }
        },
        inputs: {
          labels: string[],
          bonds?: { uuid: string, name: string, direction: string }[],
          properties: {
            nuclearies: any
          }
        }
      }
    } = {
      modification: 'update_atom_features',
      args: {
        selector: {
          properties: {
            shellies: {
              uuid: this.atomForUpdate.properties.shellies.uuid
            }
          }
        },
        inputs: {
          labels: this.atomForUpdate.labels,
          bonds: this.atomForUpdate.bonds.map(b => ({
            uuid: b.uuid,
            // Ensure OP_DEPENDENCY is applied to the correct direction for backend
            // bonds created via arrows were inverted previously; OP_DEPENDENCY should be
            // applied to the 'to' side of a bond relative to the atom being sent.
            name: b.direction === 'to' ? 'OP_DEPENDENCY' : (b.name || ''),
            direction: b.direction
          })),
          properties: {
            nuclearies: {
              title: this.atomForUpdate.properties.nuclearies.title,
              description: this.atomForUpdate.properties.nuclearies.description,
              content: this.str2json(this.atomForUpdate.properties.nuclearies.content),
              constants: this.atomForUpdate.properties.nuclearies.constants,
              operation: this.str2json(this.atomForUpdate.properties.nuclearies.operation)
            }
          }
        }
      }
    };

    console.log('[Operation] Sending mutation to backend...');
    this.atomService.modifyAtoms(mq).subscribe({
      next: (data) => {
        console.log('[Operation] Backend update successful:', data);
        // Update original state after successful save
        this.originalAtomState = JSON.parse(JSON.stringify(this.atomForUpdate));
        this.atomForUpdate.isDirty = false;
        // Emit the updated atom for bidirectional sync
        this.atomUpdated.emit(this.atomForUpdate);
        // Update store to reflect clean state
        this.atomStore.updateAtom(this.atomForUpdate);
      },
      error: (error) => {
        console.error('There was an error updating the atom data:', error);
      }
    });
  }

  canSaveAtom(): boolean {
    return this.atomForUpdate.labels.length > 0 &&
           this.atomForUpdate.properties.nuclearies.title.trim() !== '';
  }

  onLabelInputKeydown(event: KeyboardEvent): void {
    const key = event.key;

    if (key === 'Enter' || key === ',' || key === ' ' || key === 'Spacebar') {
      event.preventDefault();
      this.addLabelFromInput();
      return;
    }

    if (key === 'Backspace' && !this.labelInputValue) {
      event.preventDefault();
      this.removeLastLabel();
    }
  }

  onLabelInputBlur(): void {
    this.addLabelFromInput();
  }

  onLabelInputPaste(event: ClipboardEvent): void {
    const clipboardData = event.clipboardData?.getData('text') ?? '';

    if (!clipboardData.trim()) {
      return;
    }

    event.preventDefault();
    const combined = `${this.labelInputValue}${clipboardData}`;
    this.addLabelsFromText(combined);
    this.labelInputValue = '';
  }

  removeLabel(index: number): void {
    if (!Array.isArray(this.atomForUpdate.labels) || index < 0 || index >= this.atomForUpdate.labels.length) {
      return;
    }

    this.atomForUpdate.labels = this.atomForUpdate.labels.filter((_, i) => i !== index);
    this.markAsDirty();
  }

  private addLabelFromInput(): void {
    if (!this.labelInputValue.trim()) {
      this.labelInputValue = '';
      return;
    }

    this.addLabelsFromText(this.labelInputValue);
    this.labelInputValue = '';
  }

  private addLabelsFromText(text: string): void {
    this.splitLabelsString(text).forEach(segment => this.addLabel(segment));
  }

  private addLabel(label: string): void {
    const normalized = label.trim();
    if (!normalized) {
      return;
    }

    if (!Array.isArray(this.atomForUpdate.labels)) {
      this.atomForUpdate.labels = [];
    }

    const alreadyExists = this.atomForUpdate.labels.some(existing =>
      typeof existing === 'string' && existing.toLowerCase() === normalized.toLowerCase()
    );

    if (alreadyExists) {
      return;
    }

    this.atomForUpdate.labels = [...this.atomForUpdate.labels, normalized];
    this.markAsDirty();
  }

  private removeLastLabel(): void {
    if (!Array.isArray(this.atomForUpdate.labels) || this.atomForUpdate.labels.length === 0) {
      return;
    }

    this.removeLabel(this.atomForUpdate.labels.length - 1);
  }

  private splitLabelsString(value: string): string[] {
    return value
      .split(/[\s,]+/)
      .map(part => part.trim())
      .filter(part => part.length > 0);
  }

  private sanitizeLabels(labels: unknown): string[] {
    if (Array.isArray(labels)) {
      return labels
        .map(label =>
          typeof label === 'string' ? label.trim() : (label !== null && label !== undefined ? String(label).trim() : '')
        )
        .filter(label => label.length > 0);
    }

    if (typeof labels === 'string') {
      return this.splitLabelsString(labels);
    }

    return [];
  }

  private prepareAtomForUpdate(atom: Atom | null): void {
    // Create a deep copy to avoid reference issues
    const source = atom ?? this.initializeUpdateAtom();
    const target = JSON.parse(JSON.stringify(source));
    target.labels = this.sanitizeLabels(target.labels);

    // Update bond names to show connected atom titles instead of bond names
    target.bonds = target.bonds.map((bond: any) => {
      const connectedAtom = this.atomStore.getAtomByUuid(bond.uuid);
      // Try to get title from connected atom, otherwise fall back to existing displayName, then name
      const displayName = connectedAtom
        ? (connectedAtom.properties.nuclearies.title || bond.name)
        : (bond.displayName || bond.name);

      return {
        ...bond,
        // Keep original 'name' for backend payloads; use 'displayName' for UI badges
        displayName
      };
    });

    this.atomForUpdate = target;
    // Store a deep copy of the original state for change detection
    this.originalAtomState = JSON.parse(JSON.stringify(target));
    this.atomForUpdate.isDirty = false;
    this.labelInputValue = '';

    // Validate and parse operation
    this.validateAndParseOperation();

    // Update the selected operation type based on the operation string
    this.updateSelectedOperationType();
  }

  private updateSelectedOperationType(): void {
    const operation = this.atomForUpdate.properties.nuclearies.operation || '';

    if (!operation.trim()) {
      this.selectedOperationType = 'empty';
      return;
    }

    // Extract all operators from the operation
    const operators = new Set<string>();
    const parts = operation.split(' ');

    for (let i = 1; i < parts.length; i += 2) {
      if (parts[i]) {
        operators.add(parts[i]);
      }
    }

    // If no operators or mixed operators, set to none
    if (operators.size === 0 || operators.size > 1) {
      this.selectedOperationType = 'none';
      return;
    }

    // Single operator type - determine which one
    const operator = Array.from(operators)[0];
    const operatorTypeMap: { [key: string]: string } = {
      '+': 'add',
      '-': 'sub',
      '*': 'mult',
      '/': 'div'
    };

    this.selectedOperationType = operatorTypeMap[operator] || 'none';
  }

  private hasAtomChanged(original: any, current: any): boolean {
    return JSON.stringify(original) !== JSON.stringify(current);
  }

  // notifyAtomForUpdateChange removed, replaced by markAsDirty


  onOperationTypeChange(type: string) {
    console.log('[Operation] Dropdown changed to:', type);
    this.selectedOperationType = type;

    // Handle "empty" option - clear operation textbox only (no backend update)
    if (type === 'empty') {
      this.atomForUpdate.properties.nuclearies.operation = '';
      this.isOperationValid = true;
      this.parsedOperationTokens = [];
      console.log('[Operation] Set to empty, textbox cleared');
      this.markAsDirty();
      return;
    }

    // Handle "none" option - do nothing, allow mixed operators
    if (type === 'none') {
      return;
    }

    if (type === '' || !this.atomForUpdate.bonds || this.atomForUpdate.bonds.length < 2) {
      return;
    }

    const operatorMap: { [key: string]: string } = {
      'add': '+',
      'sub': '-',
      'mult': '*',
      'div': '/'
    };

    const operator = operatorMap[type] || type;
    const bondUuids = this.atomForUpdate.bonds
      .filter(bond => bond.direction === 'from')
      .map(bond => bond.uuid);
    const operationString = bondUuids.join(` ${operator} `);
    this.atomForUpdate.properties.nuclearies.operation = operationString;
    console.log('[Operation] Textbox set to:', operationString);

    // Validate and parse
    this.validateAndParseOperation();
    this.updateSelectedOperationType();
    console.log('[Operation] Validation done, isValid:', this.isOperationValid);

    this.markAsDirty();
  }

  onOperationDisplayClick(): void {
    this.isOperationFieldFocused = true;
    // Focus the input after Angular updates the DOM
    setTimeout(() => {
      if (this.operationInput) {
        this.operationInput.nativeElement.focus();
      }
    }, 0);
  }

  onOperationFieldFocus(): void {
    this.isOperationFieldFocused = true;
  }

  onOperationFieldBlur(): void {
    console.log('[Operation] Field blur triggered');
    this.isOperationFieldFocused = false;

    // Validate and parse the operation string
    this.validateAndParseOperation();

    // Update dropdown based on operation content
    this.updateSelectedOperationType();

    this.markAsDirty();
  }  private validateAndParseOperation(): void {
    const operation = this.atomForUpdate.properties.nuclearies.operation || '';

    // Empty string is valid
    if (!operation.trim()) {
      this.isOperationValid = true;
      this.parsedOperationTokens = [];
      return;
    }

    // Parse and validate the operation string
    const tokens = this.parseOperationString(operation);

    if (!tokens) {
      this.isOperationValid = false;
      this.parsedOperationTokens = [];
      return;
    }

    this.isOperationValid = true;
    this.parsedOperationTokens = tokens;
  }

  private parseOperationString(operation: string): Array<{type: 'uuid' | 'operator', value: string, title?: string}> | null {
    // Split by spaces to get tokens
    const parts = operation.split(' ').filter(p => p.trim());

    if (parts.length === 0) {
      return [];
    }

    // Must alternate between UUID and operator: UUID op UUID op UUID...
    // Must start and end with UUID (odd number of parts)
    if (parts.length % 2 === 0) {
      return null;
    }

    const tokens: Array<{type: 'uuid' | 'operator', value: string, title?: string}> = [];
    const bondUuids = new Set(this.atomForUpdate.bonds.map(b => b.uuid));
    const validOperators = new Set(['+', '-', '*', '/']);

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];

      if (i % 2 === 0) {
        // Should be UUID
        if (!bondUuids.has(part)) {
          return null;
        }

        // Find the atom title for this UUID
        const bond = this.atomForUpdate.bonds.find(b => b.uuid === part);
        const atomTitle = bond?.displayName || bond?.name || part;

        tokens.push({
          type: 'uuid',
          value: part,
          title: atomTitle
        });
      } else {
        // Should be operator
        if (!validOperators.has(part)) {
          return null;
        }

        tokens.push({
          type: 'operator',
          value: part
        });
      }
    }

    return tokens;
  }

  /**
   * Load atom features for updating (copied from control.detail)
   */
  retrieveAtomFeatures(uuid?: string) {
    const targetUuid = uuid || this.atomForUpdate.properties.shellies.uuid;
    if (!targetUuid) {
      console.error('UUID is required to load atom for update');
      return;
    }

    let rq: {
      readout: string,
      args: {
        selector: {
          properties: {
            shellies: {
              uuid: string
            }
          }
        }
      }
    } = {
      readout: 'retrieve_atom_features_nested',
      args: {
        selector: {
          properties: {
            shellies: {
              uuid: targetUuid
            }
          }
        }
      }
    };

    this.atomService.readAtoms(rq).subscribe({
      next: (data) => {
        const loadedAtom = this.atomDataFeaturesToString(this.atomDataToCamelCase(data['result'][0]));
        this.prepareAtomForUpdate(loadedAtom);
        this.selectedOperationType = ''; // Reset operation type when loading new atom
        // Update atom store with the complete atom data
        this.atomStore.updateAtom(loadedAtom);
      },
      error: (error) => {
        console.error('There was an error retrieving the atom data:', error);
      }
    });
  }

  onCleanButtonClick(): void {
    this.prepareAtomForUpdate(null);
  }

  // onFormButtonClick removed, replaced by saveAtom


  private fetchAndIntegrateNewAtom(newUuid: string): void {
    // Fetch the newly created atom
    const rq = {
      readout: 'retrieve_atom_features_nested',
      args: {
        selector: {
          properties: {
            shellies: {
              uuid: newUuid
            }
          }
        }
      }
    };

    this.atomService.readAtoms(rq).subscribe({
      next: (data) => {
        if (data.result && data.result.length > 0) {
          const newAtom = data.result[0];
          // Update the atom store with the new atom
          this.atomStore.updateAtom(newAtom);
          // Emit event to notify parent component about new atom
          this.atomCreated.emit(newAtom);
          // Auto-select the new atom (this will trigger sidebar refresh)
          this.atomSelection.selectAtom(newUuid);
        }
      },
      error: (error) => {
        console.error('There was an error fetching the newly created atom:', error);
      }
    });
  }

  // updateAtomFeatures removed, replaced by updateAtom


  /**
   * Destroy atom (copied from control.detail)
   */
  destroyAtoms() {
    if (!this.atomForUpdate.properties.shellies.uuid) {
      console.error('UUID is required to destroy atom');
      return;
    }

    let mq: {
      modification: string,
      args: {
        selector: {
          uuids: string[]
        }
      }
    } = {
      modification: 'destroy_atoms',
      args: {
        selector: {
          uuids: [this.atomForUpdate.properties.shellies.uuid]
        }
      }
    };

    this.atomService.modifyAtoms(mq).subscribe({
      next: (data) => {
        // Emit event to notify parent component about atom deletion
        this.atomDeleted.emit(this.atomForUpdate.properties.shellies.uuid);
        // Reset the atom after successful destruction
        this.prepareAtomForUpdate(null);
        // Clear the selection since the atom no longer exists
        this.atomSelection.selectAtom(null);
      },
      error: (error) => {
        console.error('There was an error destroying the atom:', error);
      }
    });
  }

  // Helper methods (copied from control.detail)
  private atomDataToCamelCase(data: any) {
    data.properties.shellies.changeHistory = data.properties.shellies.change_history;
    delete data.properties.shellies.change_history;
    return data;
  }

  private atomDataFeaturesToString(atom: Atom): any {
    // Create a display-friendly copy for form fields
    const displayAtom = JSON.parse(JSON.stringify(atom));

    if (typeof displayAtom.properties.nuclearies.content === 'object') {
      if (displayAtom.properties.nuclearies.content) {
        displayAtom.properties.nuclearies.content = JSON.stringify(displayAtom.properties.nuclearies.content, null, 2);
      } else {
        displayAtom.properties.nuclearies.content = '';
      }
    } else {
      displayAtom.properties.nuclearies.content = displayAtom.properties.nuclearies.content.toString();
    }

    if (typeof displayAtom.properties.nuclearies.operation === 'object') {
      if (displayAtom.properties.nuclearies.operation) {
        displayAtom.properties.nuclearies.operation = JSON.stringify(displayAtom.properties.nuclearies.operation, null, 2);
      } else {
        displayAtom.properties.nuclearies.operation = '';
      }
    } else {
      displayAtom.properties.nuclearies.operation = displayAtom.properties.nuclearies.operation.toString();
    }

    if (typeof displayAtom.properties.nuclearies.constants === 'object') {
      if (displayAtom.properties.nuclearies.constants && Object.keys(displayAtom.properties.nuclearies.constants).length > 0) {
        displayAtom.properties.nuclearies.constants = JSON.stringify(displayAtom.properties.nuclearies.constants, null, 2);
      } else {
        displayAtom.properties.nuclearies.constants = '';
      }
    }

    return displayAtom;
  }

  private str2json(value: any) {
    let result = value;
    if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
      result = JSON.parse(value);
    }
    return result;
  }
}
