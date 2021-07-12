export default function customError(message: string, error: Error) {
  const err = new Error(message + ' ' + error.message)
  err.stack = error.stack
  return err
}
