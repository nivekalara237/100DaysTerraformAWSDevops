import { Inject, Injectable } from '@angular/core'
import { AuthInteractor } from '../../core/interactor/auth.interactor'
import { HTTP_AUTH_REPOSITORY } from '../../infra/endpoints/http/auth-http.repository'
import { TokenLocalManagerInteractor } from '../../core/interactor/token-local-manager.interactor'
import { map, Observable, of } from 'rxjs'
import { MEMORY_TOKEN_REPOSITORY } from '../../infra/memory/token-local-manager.repository'

@Injectable({ providedIn: 'root' })
export class LoginService {
  constructor(
    @Inject(MEMORY_TOKEN_REPOSITORY) private tokenManager: TokenLocalManagerInteractor,
    @Inject(HTTP_AUTH_REPOSITORY) private authInteractor: AuthInteractor) {
  }

  login(email: string, password: string): Observable<boolean> {
    if (![email, password].every(value => !!value)) {
      return of(false)
    }
    return this.authInteractor.signIn(email, password)
      .pipe(
        map(value => {
          if (value && value.idToken) {
            this.tokenManager.setToken(value.idToken, value.refreshToken, value.expiredIn)
            return true
          }
          return false
        })
      )
  }
}
