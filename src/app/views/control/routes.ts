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
        redirectTo: 'detail',
        pathMatch: 'full'
      },
      {
        path: 'detail',
        loadComponent: () => import('./detail/control.detail.component').then(m => m.ControlDetailComponent),
        data: {
          title: 'Detail'
        }
      },
      {
        path: 'overview',
        loadComponent: () => import('./overview/control.overview.component').then(m => m.ControlOverviewComponent),
        data: {
          title: 'Overview'
        }
      }
    ]
  }
];
