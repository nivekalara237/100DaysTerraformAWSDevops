import { environment } from '../../../../environments/environment'

export const url = (path: string) => `${environment.apiUrl}${purify(path)}`

const purify = (path: string): string => {
  if (path.startsWith('/')) {
    return purify(path.substring(1, path.length))
  }
  return path
}
