import { Routes } from '@angular/router';

import { ControlComponent } from './control.component';

export const routes: Routes = [
  {
    path: '',
    component: ControlComponent,
    data: {
      title: 'Control'
    }
  }
];
