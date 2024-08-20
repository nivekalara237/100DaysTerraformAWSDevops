import { storage } from '../../utils/local.storage'
import { TokenLocalManagerInteractor } from '../../core/interactor/token-local-manager.interactor'
import { Injectable, InjectionToken } from '@angular/core'
import moment from 'moment'

export const ID_TOKEN = 'idToken'

export const MEMORY_TOKEN_REPOSITORY = new InjectionToken<TokenLocalManagerInteractor>('Token Memory repository', {
  providedIn: 'root',
  factory: () => new TokenLocalManagerRepository()
})


@Injectable({ providedIn: 'root' })
export class TokenLocalManagerRepository implements TokenLocalManagerInteractor {
  hasToken = () => {
    const token = this.getToken()
    return !!token && token.length > 0
  }

  getToken = (): string | null => {
    const token = storage().getItem(ID_TOKEN)
    if (!!token && token.length > 0) {
      return JSON.parse(token).at
    }
    return null
  }

  setToken = (nwToken: string, refreshToken?: string, expireIn?: number) => {
    storage().setItem(ID_TOKEN, nwToken)

    const token = {
      at: nwToken,
      rt: refreshToken,
      expiredAt: expireIn
    }

    if (expireIn) {
      token.expiredAt = moment().add(expireIn, 'seconds').toDate().getTime()
    }
    storage().setItem(ID_TOKEN, JSON.stringify(token))
  }

  resetToken = () => {
    storage().removeItem(ID_TOKEN)
  }

  getRefreshToken(): string | null {
    const token = storage().getItem(ID_TOKEN)
    if (!!token && token.length > 0) {
      return JSON.parse(token).rt
    }
    return null
  }

  isExpired(): boolean {
    if (this.hasToken()) {
      const token = JSON.parse(storage().getItem(ID_TOKEN)!)
      const expireDate = moment(token.expiredAt)
      const now = moment()
      return now.isAfter(expireDate)
    }
    return true
  }
}
