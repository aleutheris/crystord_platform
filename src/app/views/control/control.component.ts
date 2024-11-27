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
import { Atom, NewAtom, SearchData } from './atom.model';
import { AtomService } from './atom.service';
import { at } from 'lodash-es';

@Component({
    selector: 'app-control',
    templateUrl: './control.component.html',
    styleUrls: ['./control.component.scss'],
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
export class ControlComponent {
  atom: Atom;
  newAtom: Atom;
  atomId: string;
  searchText: string;
  searchTable: Atom[];

  constructor(private atomService: AtomService) {
    this.atomId = '';
    this.searchText = 'labels=';
    this.searchTable = [];

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

  getAllAtomFeatures(atom: Atom) {
    this.atomService.getAllAtomFeatures(atom.properties.entries.uuid).subscribe({
      next: (data) => {
        data = this.atomDataToCamelCase(data);
        data = this.convertAtomContentToString(data);
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
    sendData.nuclearies.content = this.parseValue(sendData.nuclearies.content);

    this.atomService.updateAtomNuclearies(sendData).subscribe({
      next: (data) => {
        console.log('Atom data updated successfully:', data);
      },
      error: (error) => {
        console.error('There was an error updating the atom data:', error);
      }
    });
  }

  searchAtoms() {
    this.atomService.searchAtoms(this.parseSearchText()).subscribe({
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

  private atomsDataToCamelCase(data: any) {
    data.forEach((atom: any) => {
      atom.properties.nuclearies.atomType = atom.properties.nuclearies.atom_type;
      atom.properties.entries.storedAt = atom.properties.entries.stored_at;
      delete atom.properties.nuclearies.atom_type;
      delete atom.properties.entries.stored_at;
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
    const result: { labels: string[], bonds: string[] } = { labels: [], bonds: [] };

    const pairs = searchText.split(' ');

    pairs.forEach(pair => {
      const [key, value] = pair.split('=');

      if (key === 'labels') {
        result.labels = value ? value.split(',') : [];
      } else if (key === 'bonds') {
        result.bonds = value ? value.split(',') : [];
      }
    });

    return result;
  }
}
