import { Routes } from '@angular/router';
import { DefaultLayoutComponent } from './layout';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'landing',
    pathMatch: 'full'
  },
  {
    path: 'landing',
    loadComponent: () => import('./views/landing/landing.component').then(m => m.LandingComponent),
    data: {
      title: 'Welcome to Crystord'
    }
  },
  {
    path: '',
    component: DefaultLayoutComponent,
    canActivate: [authGuard],
    data: {
      title: 'Home'
    },
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./views/dashboard/routes').then((m) => m.routes)
      },
      {
        path: 'control',
        loadChildren: () => import('./views/control/routes').then((m) => m.routes)
      },
      {
        path: 'tables',
        loadChildren: () => import('./views/tables/routes').then((m) => m.routes)
      },
      {
        path: 'theme',
        loadChildren: () => import('./views/theme/routes').then((m) => m.routes)
      },
      {
        path: 'base',
        loadChildren: () => import('./views/base/routes').then((m) => m.routes)
      },
      {
        path: 'buttons',
        loadChildren: () => import('./views/buttons/routes').then((m) => m.routes)
      },
      {
        path: 'forms',
        loadChildren: () => import('./views/forms/routes').then((m) => m.routes)
      },
      {
        path: 'icons',
        loadChildren: () => import('./views/icons/routes').then((m) => m.routes)
      },
      {
        path: 'notifications',
        loadChildren: () => import('./views/notifications/routes').then((m) => m.routes)
      },
      {
        path: 'widgets',
        loadChildren: () => import('./views/widgets/routes').then((m) => m.routes)
      },
      {
        path: 'charts',
        loadChildren: () => import('./views/charts/routes').then((m) => m.routes)
      },
      {
        path: 'pages',
        loadChildren: () => import('./views/pages/routes').then((m) => m.routes)
      },
    ]
  },
  {
    path: 'gaddon',
    loadComponent: () => import('./views/gaddon/gaddon.component').then(m => m.GaddonComponent),
    data: {
      title: 'Crystord Google Add-on'
    }
  },
  {
    path: 'gaddon/privacy',
    loadComponent: () => import('./views/gaddon/privacy/privacy.component').then(m => m.PrivacyComponent),
    data: {
      title: 'Gaddon Privacy Policy'
    }
  },
  {
    path: 'gaddon/terms',
    loadComponent: () => import('./views/gaddon/terms/terms.component').then(m => m.TermsComponent),
    data: {
      title: 'Gaddon Terms of Service'
    }
  },
  {
    path: 'gaddon/support',
    loadComponent: () => import('./views/gaddon/support/support.component').then(m => m.SupportComponent),
    data: {
      title: 'Gaddon Support'
    }
  },
  {
    path: '404',
    loadComponent: () => import('./views/pages/page404/page404.component').then(m => m.Page404Component),
    data: {
      title: 'Page 404'
    }
  },
  {
    path: '500',
    loadComponent: () => import('./views/pages/page500/page500.component').then(m => m.Page500Component),
    data: {
      title: 'Page 500'
    }
  },
  {
    path: 'login',
    loadComponent: () => import('./views/pages/login/login.component').then(m => m.LoginComponent),
    data: {
      title: 'Login Page'
    }
  },
  {
    path: 'register',
    loadComponent: () => import('./views/pages/register/register.component').then(m => m.RegisterComponent),
    data: {
      title: 'Register Page'
    }
  },
  { path: '**', redirectTo: '404' }
];
