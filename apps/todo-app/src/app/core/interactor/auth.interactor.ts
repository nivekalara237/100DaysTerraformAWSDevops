import { Observable } from 'rxjs'
import { SignUp } from '../domain/sign-up.domain'
import { IdToken } from '../domain/id-token.domain'

export interface AuthInteractor {
  signIn(usernameOrEmail: string, password: string): Observable<IdToken>

  signUp(data: SignUp): Observable<any>

  confirmEmail(email: string, username: string, code: string): Observable<any>

  resendConfirmCode(email: string): Observable<any>

  getDetails(): Observable<any>
}
