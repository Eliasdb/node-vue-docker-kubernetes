import { Route } from '@angular/router';
import { PlatformLayoutComponent } from './layouts/platform/platform-layout.component';
import { PortalLayoutComponent } from './layouts/portal/portal-layout.component';
import { LoginContainer } from './pages/portal/login/login.container';
import { RegisterContainer } from './pages/portal/register/register.container';

export const routes: Route[] = [
  {
    path: '', // Platform routes with shared layout
    component: PlatformLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/platform/home/home.component').then(
            (m) => m.HomeComponent
          ),
      },

      {
        path: 'settings',
        loadComponent: () =>
          import('./pages/platform/settings/settings.component').then(
            (m) => m.SettingsContainer
          ),
      },
    ],
  },
  {
    path: 'auth',
    component: PortalLayoutComponent,
    children: [
      {
        path: 'login',
        component: LoginContainer,
      },
      {
        path: 'register',
        component: RegisterContainer,
      },
    ],
  },
  {
    path: 'appointments',
    loadChildren: () =>
      import('@eDB/appointment-app').then((m) => m.AppointmentsModule),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
