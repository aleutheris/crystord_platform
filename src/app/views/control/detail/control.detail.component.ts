import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  RowComponent,
  ColComponent,
  CardComponent,
  CardHeaderComponent,
  CardBodyComponent,
  InputGroupComponent,
  InputGroupTextDirective,
  FormControlDirective,
  FormLabelDirective,
  FormCheckInputDirective,
  ButtonDirective,
  TableDirective,
} from '@coreui/angular';
import { FormsModule } from '@angular/forms';
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
      CardComponent,
      CardHeaderComponent,
      CardBodyComponent,
      InputGroupComponent,
      InputGroupTextDirective,
      FormControlDirective,
      FormLabelDirective,
      FormCheckInputDirective,
      ButtonDirective,
      FormsModule,
      TableDirective
    ]
  })
export class ControlDetailComponent {
  atom: Atom;
  newAtom: Atom;
  searchText: string;
  isSearchTextValid: boolean | undefined = undefined;
  searchTable: Atom[];

  constructor(private atomService: AtomService) {
    this.searchText = 'labels=';
    this.isSearchTextValid = undefined;
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
          constants: '',
          operation: ''
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
          constants: '',
          operation: ''
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
      readout: 'retrieve_atom_features_nested',
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
        this.atom = this.atomDataToCamelCase(data['result'][0]);
        this.atom = this.atomDataFeaturesToString(this.atom);
        this.isSearchTextValid = true;
      },
      error: (error) => {
        console.error('There was an error retrieving the atom data:', error);
        this.isSearchTextValid = false;
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
              content: this.str2json(this.atom.properties.nuclearies.content),
              constants: this.atom.properties.nuclearies.constants,
              operation: this.str2json(this.atom.properties.nuclearies.operation)
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
        this.isSearchTextValid = true;
      },
      error: (error) => {
        console.error('There was an error searching for atoms:', error);
        this.isSearchTextValid = false;
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
      atom = this.atomDataFeaturesToString(atom);
    });
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

  private parseSearchText() {
    const searchText = this.searchText;
    const result: {
      readout: string,
      args: {
        selector: Atom
      }
    } = {
      readout: 'retrieve_atoms_features',
      args: {
        selector: {
          bonds: [],
          labels: [],
          properties: {
            shellies: {
              uuid: "",
              changeHistory: []
            },
            nuclearies: {
              title: "",
              description: "",
              content: "",
              constants: "",
              operation: ""
            },
            ionies: {}
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
