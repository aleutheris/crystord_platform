import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Atom Control'
    },
    children: [
      {
        path: '',
        loadComponent: () => import('./overview/control.overview.component').then(m => m.ControlOverviewComponent),
        data: {
          title: 'Overview'
        }
      }
    ]
  }
];
