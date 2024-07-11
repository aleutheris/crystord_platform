import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
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
      ReactiveFormsModule
    ]
  })
export class ControlComponent {
  atom: Atom;

  constructor(private atomService: AtomService) {
    this.atom = {
      title: '',
      description: '',
      labels: [],
      content: '',
      constants: [],
      operations: ''
    };
  }

  // Function which makes a REST API GET Call to get all atom data
  getAtomAll() {
    // REST API Call

  }

  atomId: string = '801dd83d-a804-48e9-8a1a-e4cc5fa271a3';
  getAtomContent() {
    this.atomService.getAtomContent(this.atomId).subscribe({
      next: (data) => {
        this.atom.content = data.result;
      },
      error: (error) => {
        console.error('There was an error retrieving the atom data:', error);
      }
    });
  }
}
