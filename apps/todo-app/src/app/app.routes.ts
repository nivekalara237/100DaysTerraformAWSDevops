import { Routes } from '@angular/router'
import { notesRoutes } from './notes/notes.routes'
import { tasksRoutes } from './tasks/tasks.routes'

export const routes: Routes = [
  {
    path: 'tasks',
    children: tasksRoutes
  },
  {
    path: 'notes',
    children: notesRoutes
  },
  {
    path: 'coming-soon',
    loadComponent: () => import('./coming-soon/coming-soon.component')
      .then(c => c.ComingSoonComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component')
      .then(c => c.DashboardComponent)
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
