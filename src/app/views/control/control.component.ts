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
  FormSelectDirective
} from '@coreui/angular';
import { Atom, NewAtom } from './atom.model';
import { AtomService } from './atom.service';

@Component({
    selector: 'app-control',
    templateUrl: './control.component.html',
    styleUrls: ['./control.component.scss'],
    standalone: true,
    imports: [
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
      FormsModule
    ]
  })
export class ControlComponent {
  atom: Atom;
  newAtom: Atom;
  atomId: string;

  constructor(private atomService: AtomService) {
    this.atomId = '';

    this.atom = {
      labels: [],
      bonds: [],
      properties: {
        entries: {
          uuid: '',
          storedAt: ''
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
        entries: {
          uuid: '',
          storedAt: ''
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

  createAtom() {
    let tempAtom: NewAtom;

    tempAtom = {
      title: this.newAtom.properties.nuclearies.title,
      labels: this.newAtom.labels
    };

    this.atomService.createAtom(tempAtom).subscribe({
      next: (data) => {
        console.log('Atom created successfully:', data);
        this.atomId = data['result'];
      },
      error: (error) => {
        console.error('There was an error creating the atom:', error);
      }
    });
  }

  getAllAtomFeatures() {
    this.atomService.getAllAtomFeatures(this.atom.properties.entries.uuid).subscribe({
      next: (data) => {
        data = this.atomDataToCamelCase(data);
        this.atom = data;
      },
      error: (error) => {
        console.error('There was an error retrieving the atom data:', error);
      }
    });
  }

  updateAtomNuclearies() {
    let atom = JSON.parse(JSON.stringify(this.atom));
    let atomDataSnakeCase: any = this.atomDataToSnakeCase(atom);
    let atom_uuid = atomDataSnakeCase.properties.entries.uuid;
    let nuclearies = atomDataSnakeCase.properties.nuclearies;
    let sendData = {atom_uuid, nuclearies};

    this.atomService.updateAtomNuclearies(sendData).subscribe({
      next: (data) => {
        console.log('Atom data updated successfully:', data);
      },
      error: (error) => {
        console.error('There was an error updating the atom data:', error);
      }
    });
  }

  // Private methods
  private atomDataToCamelCase(data: any) {
    data.properties.nuclearies.atomType = data.properties.nuclearies.atom_type;
    data.properties.entries.storedAt = data.properties.entries.stored_at;
    delete data.properties.nuclearies.atom_type;
    delete data.properties.entries.stored_at;
    return data;
  }

  private atomDataToSnakeCase(data: any) {
    data.properties.nuclearies.atom_type = data.properties.nuclearies.atomType;
    data.properties.entries.stored_at = data.properties.entries.storedAt;
    delete data.properties.nuclearies.atomType;
    delete data.properties.entries.storedAt;
    return data;
  }
}
