import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DocsExampleComponent } from '@docs-components/public-api';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import {
  RowComponent,
  ColComponent,
  CardComponent,
  CardHeaderComponent,
  CardBodyComponent,
  InputGroupComponent,
  InputGroupTextDirective,
  FormControlDirective,
  FormCheckComponent,
  TableDirective,
  ButtonDirective,
} from '@coreui/angular';
import { ComService } from './com.service';

interface Table {
  title: string;
  description: string;
  content: TableCell[][];
  headers: Headers;
  keys: Headers;
}
interface Headers {
  index: string;
  columns: string[];
}
interface TableCell {
  name: string;
  value: string;
}

interface Interaction {
  readout?: string;
  modification?: string;
  args: {
    selector?: Atom;
    inputs?: Atom;
  }
}

interface Atom {
  bonds?: string[];
  labels?: string[];
  properties?: {
    shellies?: {
      uuid: string;
      changeHistory?: string[];
    };
    nuclearies?: {
      title?: string;
      description?: string;
      content?: string;
      operation?: {};
      constants?: {};
    };
    ionies?: {
      [key: string]: string | string[] | undefined;
    };
  }
}

@Component({
    selector: 'app-table-search',
    templateUrl: './table-search.component.html',
    styleUrls: ['./table-search.component.scss'],
    standalone: true,
    imports: [
      CommonModule,
      RouterLink,
      DocsExampleComponent,
      ReactiveFormsModule,
      FormsModule,
      FormCheckComponent,
      RowComponent,
      ColComponent,
      CardComponent,
      CardHeaderComponent,
      TableDirective,
      CardBodyComponent,
      InputGroupComponent,
      InputGroupTextDirective,
      FormControlDirective,
      ButtonDirective,
    ]
})
export class TableSearchComponent {
  searchText: string;
  isSearchTextValid: boolean | undefined = undefined;
  table: Table;
  tableInteraction: Interaction;
  selectedColumns: boolean[];
  selectedIndexColumn: number;
  atom: Atom;

  constructor(private comService: ComService) {
    this.searchText = "labels=findata";
    this.isSearchTextValid = undefined;
    this.table = {
      title: '',
      description: '',
      content: [],
      headers: { index: '', columns: [] },
      keys: { index: '', columns: [] }
    };
    this.tableInteraction = { args: { selector: { labels: [] } } };
    this.selectedColumns = [];
    this.selectedIndexColumn = 0;
    this.atom = {
      labels: [],
      properties: {
        shellies: {
          uuid: '',
          changeHistory: []
        },
        nuclearies: {
          title: '',
          description: '',
          operation: ''
        }
      }
    };
  }

  formAtom() {
    this.table.headers.columns = this.table.headers.columns.filter((_, i) => this.selectedColumns[i]);
    this.table.keys.columns = this.table.keys.columns.filter((_, i) => this.selectedColumns[i]);

    this.table.headers.index = this.table.headers.columns[this.selectedIndexColumn];
    this.table.keys.index = this.table.keys.columns[this.selectedIndexColumn];

    const constants = {
      headers: this.table.headers,
      keys: this.table.keys
    };

    let modificationQuery: Interaction = {
      modification: "form_atoms",
      args: {
        inputs: {
          labels: this.tableInteraction.args.selector?.labels || [],
          properties: {
            nuclearies: {
              title: this.table.title,
              description: this.table.description,
              operation: this.tableInteraction,
              constants: constants,
            }
          }
        }
      }
    };

    this.comService.modifyAtoms(modificationQuery).subscribe({
      next: (data) => {
        this.atom = data['result'];
      },
      error: (error) => {
        console.error('There was an error creating the atom:', error);
      }
    });
  }

  getTable() {
    this.tableInteraction = this.parseSearchText();
    this.comService.readAtoms(this.tableInteraction).subscribe({
      next: (data) => {
        this.table = data['result'];
        this.isSearchTextValid = true;
        this.selectedColumns = new Array(this.table.headers.columns.length).fill(true);
      },
      error: (error) => {
        console.error('There was an error searching for findata:', error);
        this.isSearchTextValid = false;
      }
    });
  }

  private parseSearchText() {
    const searchText = this.searchText;
    const result: Interaction = {
      readout: "retrieve_table",
      args: {
        selector: {
          labels: [],
        }
      }
    };

    const pairs = searchText.split(' ');

    pairs.forEach(pair => {
      const [key, value] = pair.split('=');
      if (key === 'labels') {
        result.args.selector!.labels = value ? value.split(',') : [];
      }
    });

    return result;
  }
}
