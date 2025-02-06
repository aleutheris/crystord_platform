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
  FormSelectDirective,
  InputGroupComponent,
  InputGroupTextDirective,
  FormControlDirective,
  FormCheckInputDirective,
  ButtonDirective,
  TableDirective,
} from '@coreui/angular';
import { BelastingElement } from './belasting.model';
import { PreBelastingElement } from './belasting.model';
import { FindataElement } from './belasting.model';
import { BelastingService } from './belasting.service';

@Component({
    selector: 'app-belastingdienst',
    templateUrl: './belastingdienst.component.html',
    styleUrls: ['./belastingdienst.component.scss'],
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
      RouterLink,
      FormSelectDirective,
      ReactiveFormsModule,
      FormsModule,
      InputGroupComponent,
      InputGroupTextDirective,
      FormControlDirective,
      FormCheckInputDirective,
      ButtonDirective,
      TableDirective]
})
export class BelastingdienstComponent {
  belastingTable: [];
  preBelastingTable: PreBelastingElement[];
  findataTable: FindataElement[];
  fileToUpload: File | null;

  constructor(private belastingService: BelastingService) {
    this.belastingTable = [];
    this.preBelastingTable = [];
    this.findataTable = [];
    this.fileToUpload = null;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.fileToUpload = input.files[0];
    }
  }

  uploadFile(): void {
    if (!this.fileToUpload) {
      alert('Please select a file before uploading.');
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      const text = event.target?.result as string;
      this.parseCsv(text);
      this.updateFindataTable();
    };

    reader.readAsText(this.fileToUpload);
  }

  private parseCsv(csvText: string): void {
    const lines = csvText.split('\n');
    const result: Array<FindataElement> = [];

    const header = lines[0].trim().split(',').map(column => column.trim());
    const columnIndices = {
      datum: header.indexOf('Datum'),
      bedrag: header.indexOf('Bedrag'),
      btwtarief: header.indexOf('Btw-tarief')
    };

    if (columnIndices.datum === -1 || columnIndices.bedrag === -1 || columnIndices.btwtarief === -1) {
      throw new Error('CSV header is missing one or more required columns: Datum, Bedrag, Btw-tarief');
    }

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const columns = line.split(',').map(column => column.trim());

      const datum = columns[columnIndices.datum];
      const bedrag = columns[columnIndices.bedrag];
      const btwtarief = columns[columnIndices.btwtarief];

      result.push({ datum, bedrag, btwtarief });
    }

    this.findataTable = result;
  }

  getBelastingTable() {
    let query: {readout: string} = {readout: 'get_belastingdienst_table'};
    this.belastingService.getBelastingTable(query).subscribe({
      next: (data) => {
        this.belastingTable = data['result'];
      },
      error: (error) => {
        console.error('There was an error searching for belasting:', error);
      }
    });
  }

  getPreBelastingTable() {
    let query: {readout: string} = {readout: 'get_prebelastingdienst_table'};
    this.belastingService.getPreBelastingTable(query).subscribe({
      next: (data) => {
        this.preBelastingTable = data['result'];
      },
      error: (error) => {
        console.error('There was an error searching for belasting:', error);
      }
    });
  }

  updateFindataTable() {
    let rq: {
      modification: string,
      args: {
        inputs: {
          labels: string[],
          table: {
            title: string,
            index_column: string,
            columns: string[],
            content: FindataElement[],
          }
        }
      }
    } = {
      // modification: 'create_findata',
      modification: 'create_table',
      args: {
        inputs: {
          labels: ['findata'],
          table: {
            title: 'findata',
            index_column: 'datum',
            columns: ['bedrag', 'btwtarief'],
            content: this.findataTable,
          }
        }
      }
    };

    this.belastingService.updateFindataTable(rq).subscribe({
      next: (data) => {
        console.log('Update PreBelastingTable performed successfully:', data);
      },
      error: (error) => {
        console.error('There was an error searching for belasting:', error);
      }
    });
  }

  getFindataTable() {
    let query: {
      readout: string,
      args: {
        selector: {
          labels: string[],
          table: {
            title: string,
            index_column: string,
            columns: string[]
          }
        }
      }
    } = {
      readout: "retrieve_table",
      args: {
        selector: {
          labels: ["findata"],
          table: {
            title: "findata",
            index_column: "datum",
            columns: ["bedrag", "btwtarief"]
          }
        }
      }
    };
    this.belastingService.getFindataTable(query).subscribe({
      next: (data) => {
        this.findataTable = data['result'];
        console.log('FindataTable:', this.findataTable);
      },
      error: (error) => {
        console.error('There was an error searching for findata:', error);
      }
    });
  }

  // Private methods
  // private atomDataToCamelCase(data: any) {
  //   data.properties.nuclearies.atomType = data.properties.nuclearies.atom_type;
  //   data.properties.shellies.storedAt = data.properties.shellies.stored_at;
  //   delete data.properties.nuclearies.atom_type;
  //   delete data.properties.shellies.stored_at;
  //   return data;
  // }

  // private atomDataToSnakeCase(data: any) {
  //   data.properties.nuclearies.atom_type = data.properties.nuclearies.atomType;
  //   data.properties.shellies.stored_at = data.properties.shellies.storedAt;
  //   delete data.properties.nuclearies.atomType;
  //   delete data.properties.shellies.storedAt;
  //   return data;
  // }

  // private atomsDataToCamelCase(data: any) {
  //   data.forEach((atom: any) => {
  //     atom.properties.nuclearies.atomType = atom.properties.nuclearies.atom_type;
  //     atom.properties.shellies.storedAt = atom.properties.shellies.stored_at;
  //     delete atom.properties.nuclearies.atom_type;
  //     delete atom.properties.shellies.stored_at;
  //   });
  //   return data;
  // }

  // private parseSearchText() {
  //   const searchText = this.searchText;
  //   const result: { labels: string[], bonds: string[] } = { labels: [], bonds: [] };

  //   const pairs = searchText.split(' ');

  //   pairs.forEach(pair => {
  //     const [key, value] = pair.split('=');

  //     if (key === 'labels') {
  //       result.labels = value ? value.split(',') : [];
  //     } else if (key === 'bonds') {
  //       result.bonds = value ? value.split(',') : [];
  //     }
  //   });

  //   return result;
  // }
}
