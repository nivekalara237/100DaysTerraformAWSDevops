export const url = (path: string) => `https://7y5nnjn28c.execute-api.us-east-1.amazonaws.com/dev/todo-app-api/${purify(path)}`

const purify = (path: string): string => {
  if (path.startsWith('/')) {
    return purify(path.substring(1, path.length))
  }
  return path
}
