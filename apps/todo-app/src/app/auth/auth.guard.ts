import { inject } from '@angular/core'
import { MEMORY_TOKEN_REPOSITORY } from '../infra/memory/token-local-manager.repository'
import { Router } from '@angular/router'

export const AuthGuard = () => {
  const auth = inject(MEMORY_TOKEN_REPOSITORY)
  const router = inject(Router)
  if (!auth.hasToken()) {
    router.navigateByUrl('/auth/sign-in')
    return false
  }
  return true
}
