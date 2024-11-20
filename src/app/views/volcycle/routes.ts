import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Forms'
    },
    children: [
      {
        path: '',
        redirectTo: 'finance-form',
        pathMatch: 'full'
      },
      {
        path: 'finance-form',
        loadComponent: () => import('./finance-form/form-controls.component').then(m => m.FormControlsComponent),
        data: {
          title: 'Finance Form'
        }
      },
      {
        path: 'belastingdienst',
        loadComponent: () => import('./belastingdienst/select.component').then(m => m.SelectComponent),
        data: {
          title: 'Belastingdienst'
        }
      }
    ]
  }
];
