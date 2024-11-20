import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Volcycle'
    },
    children: [
      {
        path: '',
        redirectTo: 'finance-form',
        pathMatch: 'full'
      },
      {
        path: 'finance-form',
        loadComponent: () => import('./finance-form/finance-form.component').then(m => m.FinanceFormComponent),
        data: {
          title: 'Finance Form'
        }
      },
      {
        path: 'belastingdienst',
        loadComponent: () => import('./belastingdienst/belastingdienst.component').then(m => m.BelastingdienstComponent),
        data: {
          title: 'Belastingdienst'
        }
      }
    ]
  }
];
