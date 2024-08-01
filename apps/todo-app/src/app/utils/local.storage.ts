export const storage = (): Storage => {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage
  } else if (typeof window !== 'undefined' && window.sessionStorage) {
    return window.sessionStorage
  } else {
    throw new Error('none localstorage or sessionstorage are supported')
  }
}
