export interface TokenLocalManagerInteractor {
  hasToken(): boolean

  getToken(): string | null

  getRefreshToken(): string | null

  setToken(newToken: string, refreshToken?: string, expireIn?: number): void

  resetToken(): void

  isExpired(): boolean
}
