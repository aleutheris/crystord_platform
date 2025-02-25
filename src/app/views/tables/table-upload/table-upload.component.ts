import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DocsExampleComponent } from '@docs-components/public-api';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import {
  RowComponent,
  ColComponent,
  CardComponent,
  CardHeaderComponent,
  CardBodyComponent,
  ButtonGroupComponent,
  FormSelectDirective,
  FormControlDirective,
  InputGroupComponent,
  ButtonDirective,
  TableDirective,
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

@Component({
    selector: 'app-table-upload',
    templateUrl: './table-upload.component.html',
    styleUrls: ['./table-upload.component.scss'],
    standalone: true,
    imports: [
      CommonModule,
      RouterLink,
      RowComponent,
      DocsExampleComponent,
      ReactiveFormsModule,
      FormsModule,
      ColComponent,
      CardComponent,
      CardHeaderComponent,
      CardBodyComponent,
      ButtonGroupComponent,
      FormSelectDirective,
      FormControlDirective,
      InputGroupComponent,
      ButtonDirective,
      TableDirective,
    ]
})
export class TableUploadComponent {
  fileToUpload: File | null;
  table: Table;
  tableShow: Table;
  atomUuid: string;
  searchText: string;

  tableFormCheck: UntypedFormGroup;

  constructor(private comService: ComService, private formBuilder: UntypedFormBuilder) {
    this.searchText = '';
    this.fileToUpload = null;
    this.table = {
      title: '',
      description: '',
      content: [],
      headers: { index: '', columns: [] },
      keys: { index: '', columns: [] }
    };
    this.tableShow = {
      title: '',
      description: '',
      content: [],
      headers: { index: '', columns: [] },
      keys: { index: '', columns: [] }
    };
    this.atomUuid = '';

    this.tableFormCheck = this.formBuilder.group({});
  }

  setIndexColumn(event: Event) {
    this.table.headers.index = (event.target as HTMLSelectElement).value;

    const value = this.tableFormCheck.value;
    value[this.table.headers.index] = true;
    this.tableFormCheck.setValue(value);
  }

  setCheckBoxValue(controlName: string) {
    const prevValue = this.tableFormCheck.get(controlName)?.value;
    const value = this.tableFormCheck.value;
    value[controlName] = !prevValue;
    this.tableFormCheck.setValue(value);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.fileToUpload = input.files[0];
      const reader = new FileReader();

      reader.onload = (event) => {
        const text = event.target?.result as string;
        this.parseCsv(text);
      };
      reader.readAsText(this.fileToUpload);
    }
  }

  uploadFile(): void {
    if (!this.fileToUpload) {
      alert('Please select a file before uploading.');
      return;
    }

    const updateTableHeaders = (): void => {
      let keys: string[] = [];
      let headers: string[] = [];
      Object.keys(this.tableFormCheck.controls).forEach((controlName: string) => {
        const control = this.tableFormCheck.get(controlName) as UntypedFormControl;
        if (control.value) {
          keys.push(this.toValidIdentifier(controlName));
          headers.push(controlName);
        }
      });
      this.table.keys.columns = keys;
      this.table.keys.index = this.toValidIdentifier(this.table.headers.index);
      this.table.headers.columns = headers;
      this.table.headers.index = this.table.headers.index;
    };

    const removeUnchosenColumns = (): void => {
      this.table.content = this.table.content.map(row => {
        return row.filter(cell => this.table.keys.columns.includes(cell.name));
      });
    };

    updateTableHeaders();
    removeUnchosenColumns();

    this.updateTable();
  }

  private parseCsv(csvText: string): void {
    const lines = csvText.split('\n');
    const content: TableCell[][] = [];

    const headers = lines[0].trim().split(',').map(column => column.trim());
    const keys = headers.map(header => this.toValidIdentifier(header));

    for (const column of headers) {
      this.tableFormCheck.addControl(column, new UntypedFormControl(false));
    }

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const columns = line.split(',').map(column => column.trim());

      const row: TableCell[] = columns.map((value, cell) => ({
        name: this.toValidIdentifier(headers[cell]),
        value: value
      }));

      content.push(row);
    }

    this.table.content = content;
    this.table.headers.columns = headers;
    this.table.keys.columns = keys;
  }

  updateTable() {
    let rq: {
      modification: string,
      args: {
        inputs: {
          labels: string[],
          table: Table
        }
      }
    } = {
      modification: 'create_table',
      args: {
        inputs: {
          labels: ['findata'],
          table: this.table
        }
      }
    };

    this.comService.updateTable(rq).subscribe({
      next: (data) => {
        this.atomUuid = data['result'];
      },
      error: (error) => {
        console.error('There was an error searching for the table:', error);
      }
    });
  }

  private toValidIdentifier(input: string): string {
    if (!input) return '';

    let result = input.toLowerCase();
    result = result.replace(/[^a-z0-9_]/g, '');

    if (/^[0-9]/.test(result)) {
      result = '_' + result;
    }

    return result;
  }
}
