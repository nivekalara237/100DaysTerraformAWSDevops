import { Routes } from '@angular/router'
import { notesRoutes } from './notes/notes.routes'
import { tasksRoutes } from './tasks/tasks.routes'
import { authRoutes } from './auth/auth.route'
import { AuthGuard } from './auth/auth.guard'

export const routes: Routes = [
  {
    path: 'auth',
    children: authRoutes
  },
  {
    path: 'tasks',
    children: tasksRoutes,
    canActivate: [AuthGuard]
  },
  {
    path: 'notes',
    children: notesRoutes,
    canActivate: [AuthGuard]
  },
  {
    path: 'coming-soon',
    loadComponent: () => import('./coming-soon/coming-soon.component')
      .then(c => c.ComingSoonComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component')
      .then(c => c.DashboardComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'home',
    redirectTo: '/dashboard'
  },
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: '**',
    loadComponent: () => import('./components/pages/404/404.component')
      .then(c => c.Page404Component)
  }

]
