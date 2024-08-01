import { Routes } from '@angular/router'

export const notesRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./notes.component')
      .then(c => c.NotesComponent)
  }
]
