import { Routes } from '@angular/router'

export const authRoutes: Routes = [
  {
    path: 'sign-in',
    loadComponent: () => import('./login/login.component')
      .then(c => c.LoginComponent)
  },
  {
    path: 'sign-up',
    loadComponent: () => import('./signup/signup.component')
      .then(c => c.SignupComponent)
  },
  {
    path: 'confirm-email',
    loadComponent: () => import('./confirm-email/confirm-email.component')
      .then(c => c.ConfirmEmailComponent)
  }
]
