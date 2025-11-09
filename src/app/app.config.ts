import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { APOLLO_OPTIONS, ApolloModule } from 'apollo-angular';
import { apolloOptionsFactory } from './graphql/apollo-angular.config';
import { HttpLink } from 'apollo-angular/http';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import {
  provideRouter,
  withEnabledBlockingInitialNavigation,
  withInMemoryScrolling,
  withRouterConfig,
  withViewTransitions
} from '@angular/router';

import { DropdownModule, SidebarModule } from '@coreui/angular';
import { IconSetService } from '@coreui/icons-angular';
import { routes } from './app.routes';
import { authInterceptor } from './services/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes,
      withRouterConfig({
        onSameUrlNavigation: 'reload'
      }),
      withInMemoryScrolling({
        scrollPositionRestoration: 'top',
        anchorScrolling: 'enabled'
      }),
      withEnabledBlockingInitialNavigation(),
      withViewTransitions()
    ),
  importProvidersFrom(SidebarModule, DropdownModule, ApolloModule),
    IconSetService,
    provideAnimations(),
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
    // Apollo GraphQL client (ApolloClientOptions via factory)
    { provide: APOLLO_OPTIONS, useFactory: apolloOptionsFactory, deps: [HttpLink] }
  ]
};
