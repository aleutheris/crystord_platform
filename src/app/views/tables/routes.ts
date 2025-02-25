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
        redirectTo: 'table-upload',
        pathMatch: 'full'
      },
      {
        path: 'table-upload',
        loadComponent: () => import('./table-upload/table-upload.component').then(m => m.TableUploadComponent),
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
