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
import { Atom } from './atom.model';
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
  private atom?: Atom;
  atomId: string;
  newAtom: Atom;

  constructor(private atomService: AtomService) {
    this.atomId = '';

    // this.atom = {
    //   labels: [],
    //   bonds: [],
    //   properties: {
    //     entries: {
    //       id: '',
    //       storedAt: ''
    //     },
    //     nuclearies: {
    //       title: '',
    //       description: '',
    //       content: '',
    //       constants: [],
    //       operation: '',
    //       atomType: ''
    //     },
    //     ionies: {}
    //   }
    // };

    this.newAtom = {
      labels: [],
      bonds: [],
      properties: {
        entries: {
          id: '',
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

  getAllAtomFeatures() {
    this.atomService.getAllAtomFeatures(this.atomId).subscribe({
      next: (data) => {
        data = this.assignAtomData(data);
        this.atom = data;
      },
      error: (error) => {
        console.error('There was an error retrieving the atom data:', error);
      }
    });
  }

  assignAtomData(data: any) {
    data.properties.nuclearies.atomType = data.properties.nuclearies.atom_type;
    data.properties.entries.storedAt = data.properties.entries.stored_at;
    delete data.properties.nuclearies.atom_type;
    delete data.properties.entries.stored_at;
    return data;
  }
}
