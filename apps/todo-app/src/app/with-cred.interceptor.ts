import { Observable } from 'rxjs'
import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http'

export const withCredInterceptor = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const request = req.clone({
    withCredentials: false
  })
  return next(request)
}
