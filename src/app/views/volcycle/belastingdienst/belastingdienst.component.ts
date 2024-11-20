import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { DocsExampleComponent } from '@docs-components/public-api';
import { RowComponent, ColComponent, TextColorDirective, CardComponent, CardHeaderComponent, CardBodyComponent, FormSelectDirective } from '@coreui/angular';

@Component({
    selector: 'app-select',
    templateUrl: './belastingdienst.component.html',
    styleUrls: ['./belastingdienst.component.scss'],
    standalone: true,
    imports: [RowComponent, ColComponent, TextColorDirective, CardComponent, CardHeaderComponent, CardBodyComponent, DocsExampleComponent, FormSelectDirective, ReactiveFormsModule]
})
export class BelastingdienstComponent {

  constructor() { }

}
