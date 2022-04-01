// https://api.opensea.io/api/v1/a
// https://api.opensea.io/api/v1/assets?format=json&owner=0x618bD991B158cE30EcccbBbEE2f559370A6dea1e

export const BASE_HOST = 'https://api.opensea.io'

export const BASE_PATH = `${BASE_HOST}/api/v1`

export function assets(owner: string): string {
  return `${BASE_PATH}/assets?format=json&owner=${owner}`
}
