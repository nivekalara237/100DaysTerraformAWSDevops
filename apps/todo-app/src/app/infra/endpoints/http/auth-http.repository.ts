import { AuthInteractor } from '../../../core/interactor/auth.interactor'
import { inject, Injectable, InjectionToken } from '@angular/core'
import { catchError, map, Observable, throwError } from 'rxjs'
import { IdToken } from '../../../core/domain/id-token.domain'
import { SignUp } from '../../../core/domain/sign-up.domain'
import { HttpClient, HttpErrorResponse } from '@angular/common/http'
import { url } from './constants'

export const HTTP_AUTH_REPOSITORY = new InjectionToken<AuthInteractor>('Memory Task Repository', {
  providedIn: 'root',
  factory: () => new AuthHttpRepository()
})

@Injectable()
export class AuthHttpRepository implements AuthInteractor {

  private httpClient: HttpClient

  constructor() {
    this.httpClient = inject(HttpClient)
  }

  confirmEmail(email: string, username: string, code: string): Observable<boolean> {
    return this.httpClient.post<boolean>(
      url('/auth/confirm-email'),
      {
        email, code, username
      }, {
        observe: 'response',
        responseType: 'json'
      }
    ).pipe(
      map(response => response.status !== 200),
      catchError((err: HttpErrorResponse) => throwError(`[Error ${err.status}] ` + err.error.message))
    )
  }

  getDetails(): Observable<any> {
    return this.httpClient.get(url('/auth/details'), { observe: 'response' })
      .pipe(
        map(value => {
          if (value.status === 200) {
            return value.body
          }
          throw new Error(`Error[${value.status}] - ` + JSON.stringify(value.body))
        }),
        catchError((err: HttpErrorResponse) => throwError(`[Error ${err.status}] ` + err.error.message))
      )
  }

  resendConfirmCode(email: string): Observable<any> {
    return undefined!
  }

  signIn(usernameOrEmail: string, password: string): Observable<IdToken> {
    return this.httpClient.post<IdToken>(url('/auth/login'), {
      email: usernameOrEmail,
      username: usernameOrEmail,
      password
    }, {
      responseType: 'json',
      observe: 'response'
    })
      .pipe(
        map(value => {
          if (value.status === 200) {
            return value.body!
          }
          throw new Error(`Error[${value.status}] - ` + JSON.stringify(value.body))
        }),
        catchError((err: HttpErrorResponse) => throwError(`[Error ${err.status}] ` + err.error.message))
      )
  }

  signUp(data: SignUp): Observable<any> {
    return this.httpClient.post<any>(url('/auth/register'), data, { responseType: 'json', observe: 'response' })
      .pipe(
        map(value => {
          if (value.status === 200) {
            return value.body
          }
          throw new Error(`Error[${value.status}] - ` + JSON.stringify(value.body))
        }),
        catchError((err: HttpErrorResponse) => throwError(`[Error ${err.status}] ` + err.error.message))
      )
  }

}
