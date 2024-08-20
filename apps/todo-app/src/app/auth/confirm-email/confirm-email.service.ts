import { Inject, Injectable } from '@angular/core'
import { HTTP_AUTH_REPOSITORY } from '../../infra/endpoints/http/auth-http.repository'
import { AuthInteractor } from '../../core/interactor/auth.interactor'
import { Observable } from 'rxjs'

@Injectable({ providedIn: 'root' })
export class ConfirmEmailService {
  constructor(@Inject(HTTP_AUTH_REPOSITORY) private authService: AuthInteractor) {
  }

  confirm = (email: string, username: string, code: string): Observable<boolean> => {
    return this.authService.confirmEmail(email, username, code)
  }
}
