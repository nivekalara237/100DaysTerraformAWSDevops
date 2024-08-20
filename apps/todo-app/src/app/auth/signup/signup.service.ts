import { Inject, Injectable } from '@angular/core'
import { HTTP_AUTH_REPOSITORY } from '../../infra/endpoints/http/auth-http.repository'
import { AuthInteractor } from '../../core/interactor/auth.interactor'
import { Observable, of } from 'rxjs'
import { SignupModel } from './signup.model'

@Injectable({ providedIn: 'root' })
export class SignupService {
  constructor(
    @Inject(HTTP_AUTH_REPOSITORY) private authInteractor: AuthInteractor) {
  }

  register(userData: SignupModel): Observable<any> {
    if (![userData.email, userData.password, userData.firstName, userData.username].every(value => !!value)) {
      return of('Invalid field(s) input(s)')
    }
    return this.authInteractor.signUp(userData)
  }
}
