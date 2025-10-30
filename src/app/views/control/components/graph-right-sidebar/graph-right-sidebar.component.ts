import { Component, Input, Output, EventEmitter, ContentChild, TemplateRef, AfterContentInit } from '@angular/core';
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
import { GraphFacadeService } from '../../services/graph-facade.service';

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

  @ContentChild(TemplateRef) contentTemplate!: TemplateRef<any>;

  isExpanded: boolean = true;
  hasProjectedContent: boolean = false;

  // Atom update properties
  atomForUpdate: Atom = this.initializeUpdateAtom();

  // Operation type dropdown
  selectedOperationType: string = '';

  // Label input buffer
  labelInputValue: string = '';

  // Selected atom UUID
  selectedAtomUuid: string | null = null;

  constructor(private graph: GraphFacadeService) {
    // Keep sidebar in sync with current selection and store changes
    this.graph.selectedAtom$().subscribe(atom => {
      this.selectedAtomUuid = atom?.properties?.shellies?.uuid ?? null;
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
          constants: '',
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
    this.notifyAtomForUpdateChange();
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
    this.notifyAtomForUpdateChange();
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
    this.notifyAtomForUpdateChange();
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
    const target = atom ?? this.initializeUpdateAtom();
    target.labels = this.sanitizeLabels(target.labels);
    this.atomForUpdate = target;
    this.labelInputValue = '';
  }

  private notifyAtomForUpdateChange(): void {
    if (this.atomForUpdate.properties.shellies.uuid) {
      this.graph.updateLocalAtom(this.atomForUpdate);
    }
  }

  onOperationTypeChange(type: string) {
    this.selectedOperationType = type;

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
  }

  /**
   * Load atom features for updating (copied from control.detail)
   */
  retrieveAtomFeatures() {
    if (!this.atomForUpdate.properties.shellies.uuid) {
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
              uuid: this.atomForUpdate.properties.shellies.uuid
            }
          }
        }
      }
    };

    this.graph.loadAtom(this.atomForUpdate.properties.shellies.uuid).subscribe({
      next: (data) => {
        const loadedAtom = this.atomDataFeaturesToString(this.atomDataToCamelCase(data['result'][0]));
        this.prepareAtomForUpdate(loadedAtom);
        this.selectedOperationType = ''; // Reset operation type when loading new atom
        console.log('Atom loaded successfully:', this.atomForUpdate);
      },
      error: (error) => {
        console.error('There was an error retrieving the atom data:', error);
      }
    });
  }

  /**
   * Update atom features (copied from control.detail)
   */
  updateAtomFeatures() {
    if (!this.atomForUpdate.properties.shellies.uuid) {
      console.error('UUID is required to update atom');
      return;
    }

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

    this.graph.updateAtomFeatures(this.atomForUpdate).subscribe({
      next: (data) => {
        console.log('Atom data updated successfully:', data);
      },
      error: (error) => {
        console.error('There was an error updating the atom data:', error);
      }
    });
  }

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
          properties: {
            shellies: {
              uuid: string
            }
          }
        }
      }
    } = {
      modification: 'destroy_atoms',
      args: {
        selector: {
          properties: {
            shellies: {
              uuid: this.atomForUpdate.properties.shellies.uuid
            }
          }
        }
      }
    };

    this.graph.destroyAtom(this.atomForUpdate.properties.shellies.uuid).subscribe({
      next: (data) => {
        console.log('Atom destroyed successfully:', data);
        // Reset the atom after successful destruction
        this.prepareAtomForUpdate(null);
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

  private atomDataFeaturesToString(atom: Atom) {
    if (typeof atom.properties.nuclearies.content === 'object') {
      if (atom.properties.nuclearies.content) {
        atom.properties.nuclearies.content = JSON.stringify(atom.properties.nuclearies.content, null, 2);
      } else {
        atom.properties.nuclearies.content = '';
      }
    } else {
      atom.properties.nuclearies.content = atom.properties.nuclearies.content.toString();
    }

    if (typeof atom.properties.nuclearies.operation === 'object') {
      if (atom.properties.nuclearies.operation) {
        atom.properties.nuclearies.operation = JSON.stringify(atom.properties.nuclearies.operation, null, 2);
      } else {
        atom.properties.nuclearies.operation = '';
      }
    } else {
      atom.properties.nuclearies.operation = atom.properties.nuclearies.operation.toString();
    }

    if (typeof atom.properties.nuclearies.constants === 'object') {
      if (atom.properties.nuclearies.constants) {
        atom.properties.nuclearies.constants = JSON.stringify(atom.properties.nuclearies.constants, null, 2);
      } else {
        atom.properties.nuclearies.constants = '';
      }
    } else {
      atom.properties.nuclearies.constants = atom.properties.nuclearies.constants.toString();
    }

    return atom;
  }

  private str2json(value: any) {
    let result = value;
    if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
      result = JSON.parse(value);
    }
    return result;
  }
}
