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
  // Google Slides Add-on routes
  {
    path: 'slides-addon',
    loadComponent: () => import('./views/gaddons/gslides/slides-addon.component').then(m => m.GaddonComponent),
    data: {
      title: 'Crystord Google Slides Add-on'
    }
  },
  {
    path: 'slides-addon/privacy',
    loadComponent: () => import('./views/gaddons/gslides/privacy/privacy.component').then(m => m.PrivacyComponent),
    data: {
      title: 'Google Slides Add-on Privacy Policy'
    }
  },
  {
    path: 'slides-addon/terms',
    loadComponent: () => import('./views/gaddons/gslides/terms/terms.component').then(m => m.TermsComponent),
    data: {
      title: 'Google Slides Add-on Terms of Service'
    }
  },
  {
    path: 'slides-addon/support',
    loadComponent: () => import('./views/gaddons/gslides/support/support.component').then(m => m.SupportComponent),
    data: {
      title: 'Google Slides Add-on Support'
    }
  },
  // Google Sheets Add-on routes
  {
    path: 'sheets-addon',
    loadComponent: () => import('./views/gaddons/gsheets/sheets-addon.component').then(m => m.SheetsAddonComponent),
    data: {
      title: 'Crystord Google Sheets Add-on'
    }
  },
  {
    path: 'sheets-addon/privacy',
    loadComponent: () => import('./views/gaddons/gsheets/privacy/privacy.component').then(m => m.PrivacyComponent),
    data: {
      title: 'Google Sheets Add-on Privacy Policy'
    }
  },
  {
    path: 'sheets-addon/terms',
    loadComponent: () => import('./views/gaddons/gsheets/terms/terms.component').then(m => m.TermsComponent),
    data: {
      title: 'Google Sheets Add-on Terms of Service'
    }
  },
  {
    path: 'sheets-addon/support',
    loadComponent: () => import('./views/gaddons/gsheets/support/support.component').then(m => m.SupportComponent),
    data: {
      title: 'Google Sheets Add-on Support'
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
