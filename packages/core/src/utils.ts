export function isProductionEnv() {
  return process.env.NODE_ENV !== 'production';
}
