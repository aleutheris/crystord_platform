import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'gaddon',
    loadComponent: () => import('./gaddon/gaddon.component').then(m => m.GaddonComponent),
    data: {
      title: 'Gaddon'
    }
  }
];
