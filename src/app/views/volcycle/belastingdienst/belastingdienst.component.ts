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
  TableDirective
} from '@coreui/angular';
import { BelastingElement } from './belasting.model';
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
      TableDirective]
})
export class BelastingdienstComponent {
  belastingElement: BelastingElement;
  belastingTable: BelastingElement[];
  preBelastingTable: [];

  constructor(private belastingService: BelastingService) {
    this.preBelastingTable = [];
    this.belastingTable = [];
    this.belastingElement = {
      Kwartaal: '',
      Begindatum: '',
      Einddatum: '',
      Omzet: '',
      Ontvangen: '',
      Voorbelasting: ''
    };
  }

  getBelastingTable() {
    let query: {labels: string[]} = {labels: ['belasting']};
    this.belastingService.getBelastingTable(query).subscribe({
      next: (data) => {
        // let belastingData = this.atomsDataToCamelCase(data['result']);
        // this.belastingTable = belastingData;
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

  // Private methods
  // private atomDataToCamelCase(data: any) {
  //   data.properties.nuclearies.atomType = data.properties.nuclearies.atom_type;
  //   data.properties.entries.storedAt = data.properties.entries.stored_at;
  //   delete data.properties.nuclearies.atom_type;
  //   delete data.properties.entries.stored_at;
  //   return data;
  // }

  // private atomDataToSnakeCase(data: any) {
  //   data.properties.nuclearies.atom_type = data.properties.nuclearies.atomType;
  //   data.properties.entries.stored_at = data.properties.entries.storedAt;
  //   delete data.properties.nuclearies.atomType;
  //   delete data.properties.entries.storedAt;
  //   return data;
  // }

  // private atomsDataToCamelCase(data: any) {
  //   data.forEach((atom: any) => {
  //     atom.properties.nuclearies.atomType = atom.properties.nuclearies.atom_type;
  //     atom.properties.entries.storedAt = atom.properties.entries.stored_at;
  //     delete atom.properties.nuclearies.atom_type;
  //     delete atom.properties.entries.stored_at;
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
