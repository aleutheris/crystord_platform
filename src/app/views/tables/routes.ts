import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Tables'
    },
    children: [
      {
        path: '',
        redirectTo: 'belastingdienst',
        pathMatch: 'full'
      },
      {
        path: 'belastingdienst',
        loadComponent: () => import('./belastingdienst/belastingdienst.component').then(m => m.BelastingdienstComponent),
        data: {
          title: 'Upload'
        }
      },
      {
        path: 'table-search',
        loadComponent: () => import('./table-search/table-search.component').then(m => m.BelastingdienstComponent),
        data: {
          title: 'Search'
        }
      }
    ]
  }
];
