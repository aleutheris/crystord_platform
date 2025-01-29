import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DocsExampleComponent } from '@docs-components/public-api';
import {
  RowComponent,
  ColComponent,
  TextColorDirective,
  CardComponent,
  CardHeaderComponent,
  CardBodyComponent,
  InputGroupComponent,
  InputGroupTextDirective,
  FormControlDirective,
  FormLabelDirective,
  FormCheckInputDirective,
  ButtonDirective,
  ThemeDirective,
  DropdownComponent,
  DropdownToggleDirective,
  DropdownMenuDirective,
  DropdownItemDirective,
  DropdownDividerDirective,
  FormSelectDirective,
  TableDirective,
} from '@coreui/angular';
import { Atom } from '../atomhall/atom.model';
import { AtomService } from '../atomhall/atom.service';

@Component({
    selector: 'app-control',
    templateUrl: './control.detail.component.html',
    styleUrls: ['./control.detail.component.scss'],
    standalone: true,
    imports: [
      CommonModule,
      RowComponent,
      ColComponent,
      TextColorDirective,
      CardComponent,
      CardHeaderComponent,
      CardBodyComponent,
      DocsExampleComponent,
      InputGroupComponent,
      InputGroupTextDirective,
      FormControlDirective,
      FormLabelDirective,
      FormCheckInputDirective,
      ButtonDirective,
      ThemeDirective,
      DropdownComponent,
      DropdownToggleDirective,
      DropdownMenuDirective,
      DropdownItemDirective,
      RouterLink,
      DropdownDividerDirective,
      FormSelectDirective,
      ReactiveFormsModule,
      FormsModule,
      TableDirective
    ]
  })
export class ControlDetailComponent {
  atom: Atom;
  newAtom: Atom;
  searchText: string;
  searchTable: Atom[];

  constructor(private atomService: AtomService) {
    this.searchText = 'labels=';
    this.searchTable = [];

    this.atom = {
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
          constants: [],
          operation: '',
          atomType: ''
        },
        ionies: {}
      }
    };

    this.newAtom = {
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
          constants: [],
          operation: '',
          atomType: ''
        },
        ionies: {}
      }
    };
  }

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
      },
      error: (error) => {
        console.error('There was an error creating the atom:', error);
      }
    });
  }

  destroyAtoms() {
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
              uuid: this.atom.properties.shellies.uuid
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

  retrieveAtomFeatures(atom: Atom) {
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
      readout: 'retrieve_atom_features',
      args: {
        selector: {
          properties: {
            shellies: {
              uuid: atom.properties.shellies.uuid
            }
          }
        }
      }
    };

    this.atomService.readAtoms(rq).subscribe({
      next: (data) => {
        data['result'] = this.atomDataToCamelCase(data['result']);
        data['result'] = this.convertAtomContentToString(data['result']);
        this.atom = data['result'];
      },
      error: (error) => {
        console.error('There was an error retrieving the atom data:', error);
      }
    });
  }

  updateAtomFeatures() {
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
              uuid: this.atom.properties.shellies.uuid
            }
          }
        },
        inputs: {
          labels: this.atom.labels,
          properties: {
            nuclearies: {
              title: this.atom.properties.nuclearies.title,
              description: this.atom.properties.nuclearies.description,
              content: this.parseValue(this.atom.properties.nuclearies.content),
              constants: this.atom.properties.nuclearies.constants,
              operation: this.atom.properties.nuclearies.operation
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

  retrieveAtomsFeatures() {
    this.atomService.readAtoms(this.parseSearchText()).subscribe({
      next: (data) => {
        let atomData = this.atomsDataToCamelCase(data['result']);
        atomData = this.atomsDataContentToString(atomData);
        this.searchTable = atomData;
      },
      error: (error) => {
        console.error('There was an error searching for atoms:', error);
      }
    });
  }

  // Private methods
  private atomDataToCamelCase(data: any) {
    // data.properties.nuclearies.atomType = data.properties.nuclearies.atom_type;
    data.properties.shellies.changeHistory = data.properties.shellies.change_history;
    // delete data.properties.nuclearies.atom_type;
    delete data.properties.shellies.change_history;
    return data;
  }

  private atomDataToSnakeCase(data: any) {
    // data.properties.nuclearies.atom_type = data.properties.nuclearies.atomType;
    data.properties.shellies.change_history = data.properties.shellies.changeHistory;
    // delete data.properties.nuclearies.atomType;
    delete data.properties.shellies.changeHistory;
    return data;
  }

  private atomsDataToCamelCase(data: any) {
    data.forEach((atom: any) => {
      // atom.properties.nuclearies.atomType = atom.properties.nuclearies.atom_type;
      atom.properties.shellies.changeHistory = atom.properties.shellies.change_history;
      // delete atom.properties.nuclearies.atom_type;
      delete atom.properties.shellies.change_history;
    });
    return data;
  }

  private atomsDataContentToString(data: any) {
    data.forEach((atom: any) => {
      atom = this.convertAtomContentToString(atom);
    });
    return data;
  }

  private convertAtomContentToString(atom: Atom) {
    if (typeof atom.properties.nuclearies.content !== 'string') {
      atom.properties.nuclearies.content = JSON.stringify(atom.properties.nuclearies.content);
    }
    return atom;
  }

  private parseValue(value: any) {
    if (typeof value === 'string') {
      return JSON.parse(value);
    }
  }

  private parseSearchText() {
    const searchText = this.searchText;
    const result: {
      readout: string,
      args: {
        selector: {
          bonds: string[]
          labels: string[],
          properties: {
            shellies: {
              uuid: string
            },
            nuclearies: {
              title: string,
              description: string,
              content: number,
              constants: string[],
              operation: string
            }
          }
        }
      }
    } = {
      readout: 'retrieve_atoms_features',
      args: {
        selector: {
          bonds: [],
          labels: [],
          properties: {
            shellies: {
              uuid: ''
            },
            nuclearies: {
              title: '',
              description: '',
              content: 0.0,
              constants: [],
              operation: ''
            }
          }
        }
      }
    };

    const pairs = searchText.split(' ');

    pairs.forEach(pair => {
      const [key, value] = pair.split('=');

      if (key === 'labels') {
        result.args.selector.labels = value ? value.split(',') : [];
      }
    });

    return result;
  }
}
