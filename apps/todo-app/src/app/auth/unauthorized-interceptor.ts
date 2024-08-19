import { catchError, Observable, throwError } from 'rxjs'
import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http'
import { inject } from '@angular/core'
import { Router } from '@angular/router'
import { MEMORY_TOKEN_REPOSITORY } from '../infra/memory/token-local-manager.repository'

export const unauthorizedInterceptor = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const router = inject(Router)
  const token = inject(MEMORY_TOKEN_REPOSITORY)
  return next(req).pipe(
    catchError((err: any) => {
      if (err instanceof HttpErrorResponse) {
        if (err.status === 401) {
          console.error('Unauthorized request:', err)
          router.navigate(['/auth/sign-in'], {
            queryParams: {
              from: location.href
            }
          }).then(() => {
            token.resetToken()
          })
        }
      }
      return throwError(() => err)
    })
  )
}
