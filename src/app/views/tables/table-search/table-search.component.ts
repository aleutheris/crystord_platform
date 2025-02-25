import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DocsExampleComponent } from '@docs-components/public-api';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import {
  RowComponent,
  ColComponent,
  TextColorDirective,
  CardComponent,
  CardHeaderComponent,
  CardBodyComponent,
  ButtonGroupComponent,
  ButtonToolbarComponent,
  FormSelectDirective,
  InputGroupComponent,
  InputGroupTextDirective,
  FormControlDirective,
  ButtonDirective,
  TableDirective,
  FormCheckComponent,
  FormCheckLabelDirective,
  FormCheckInputDirective,
  ThemeDirective,
  DropdownComponent,
  DropdownToggleDirective,
  DropdownMenuDirective,
  DropdownItemDirective,
  DropdownDividerDirective
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
      RowComponent,
      ColComponent,
      TextColorDirective,
      CardComponent,
      CardHeaderComponent,
      CardBodyComponent,
      ButtonGroupComponent,
      ButtonToolbarComponent,
      FormSelectDirective,
      InputGroupComponent,
      InputGroupTextDirective,
      FormControlDirective,
      ButtonDirective,
      TableDirective,
      FormCheckComponent,
      FormCheckLabelDirective,
      FormCheckInputDirective,
      ColComponent,
      CardComponent,
      CardBodyComponent,
      ButtonDirective,
      InputGroupComponent,
      FormControlDirective,
      ThemeDirective,
      DropdownComponent,
      DropdownToggleDirective,
      DropdownMenuDirective,
      DropdownItemDirective,
      DropdownDividerDirective
    ]
})
export class BelastingdienstComponent {
  searchText: string;
  isSearchTextValid: boolean | undefined = undefined;
  table: Table;

  constructor(private comService: ComService) {
    this.searchText = "labels=";
    this.isSearchTextValid = undefined;
    this.table = {
      title: '',
      description: '',
      content: [],
      headers: { index: '', columns: [] },
      keys: { index: '', columns: [] }
    };
  }

  ignoreTemp() {

  }

  getTable() {
    this.comService.getTable(this.parseSearchText()).subscribe({
      next: (data) => {
        this.table = data['result'];
        this.isSearchTextValid = true;
      },
      error: (error) => {
        console.error('There was an error searching for findata:', error);
        this.isSearchTextValid = false;
      }
    });
  }

  private parseSearchText() {
    const searchText = this.searchText;
    const result: {
      readout: string,
      args: {
        selector: {
          labels: string[],
        }
      }
    } = {
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
        result.args.selector.labels = value ? value.split(',') : [];
      }
    });

    return result;
  }
}
