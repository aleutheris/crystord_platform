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
import { AtomService } from '../../atomhall/atom.service';

export enum SidebarMode {
  CREATE_ATOM = 'create-atom',
  UPDATE_ATOM = 'update-atom'
}

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

  // Mode selector properties
  currentMode: SidebarMode = SidebarMode.CREATE_ATOM;
  SidebarMode = SidebarMode; // Expose enum to template

  modeOptions = [
    { value: SidebarMode.CREATE_ATOM, label: 'Forming' },
    { value: SidebarMode.UPDATE_ATOM, label: 'Changing' }
  ];

  // Atom creation properties (copied from detail component)
  newAtom: Atom = this.initializeNewAtom();

  // Atom update properties (separate from create mode)
  atomForUpdate: Atom = this.initializeUpdateAtom();

  constructor(private atomService: AtomService) {}

  ngOnInit() {
    this.isExpanded = this.config.defaultExpanded;
  }

  ngAfterContentInit() {
    this.hasProjectedContent = !!this.contentTemplate;
  }

  /**
   * Initialize a new atom with default structure (copied from detail component)
   */
  private initializeNewAtom(): Atom {
    return {
      labels: [],
      bonds: [],
      properties: {
        shellies: {
          uuid: '', // Empty string - UUID will be assigned by backend
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

  /**
   * Create a new atom (copied exactly from detail component)
   */
  formAtoms() {
    let mq: {
      modification: string,
      args: {
        inputs: {
          labels: string[],
          properties: {
            nuclearies: {
              title: string
            }
          }
        }
      }
    } = {
      modification: 'form_atoms',
      args: {
        inputs: {
          labels: this.newAtom.labels,
          properties: {
            nuclearies: {
              title: this.newAtom.properties.nuclearies.title
            }
          }
        }
      }
    };

    this.atomService.modifyAtoms(mq).subscribe({
      next: (data) => {
        this.newAtom = data['result'];
        console.log('Atom created successfully:', data);
      },
      error: (error) => {
        console.error('There was an error creating the atom:', error);
      }
    });
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
   * Handle mode change from dropdown
   */
  onModeChange(mode: SidebarMode) {
    this.currentMode = mode;

    // Both modes use the same title
    this.config.title = 'Atom Features';

    // Reset atoms when switching modes
    this.newAtom = this.initializeNewAtom();
    this.atomForUpdate = this.initializeUpdateAtom();
  }  /**
   * Get the current mode label for display
   */
  get currentModeLabel(): string {
    const option = this.modeOptions.find(opt => opt.value === this.currentMode);
    return option ? option.label : 'Create Atom';
  }

  /**
   * Check if Create Atom button should be enabled
   * Button is enabled only when both title and labels have content
   */
  get isCreateAtomButtonEnabled(): boolean {
    return !!(
      this.newAtom.properties.nuclearies.title?.trim() &&
      this.newAtom.labels?.length > 0 &&
      this.newAtom.labels.some(label => label?.trim())
    );
  }

  /**
   * Check if UUID should be shown (only after atom creation)
   */
  get shouldShowUuid(): boolean {
    return !!(this.newAtom.properties.shellies.uuid?.trim());
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

    this.atomService.readAtoms(rq).subscribe({
      next: (data) => {
        this.atomForUpdate = this.atomDataToCamelCase(data['result'][0]);
        this.atomForUpdate = this.atomDataFeaturesToString(this.atomForUpdate);
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

    this.atomService.modifyAtoms(mq).subscribe({
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

    this.atomService.modifyAtoms(mq).subscribe({
      next: (data) => {
        console.log('Atom destroyed successfully:', data);
        // Reset the atom after successful destruction
        this.atomForUpdate = this.initializeUpdateAtom();
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
