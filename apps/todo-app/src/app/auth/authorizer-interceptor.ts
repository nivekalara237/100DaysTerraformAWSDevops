import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http'
import { Observable } from 'rxjs'
import { inject } from '@angular/core'
import { MEMORY_TOKEN_REPOSITORY } from '../infra/memory/token-local-manager.repository'

export const authorizerInterceptor = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const tokenAuth = inject(MEMORY_TOKEN_REPOSITORY)
  const url = req.url
  if (!url.includes('/auth/') || url.endsWith('/auth/details')) {
    if (tokenAuth.hasToken()) {
      const reReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${tokenAuth.getToken()}`
          // 'Cognito-Token-Type': 'id'
        }
      })
      return next(reReq)
    }
  }
  return next(req)
}
