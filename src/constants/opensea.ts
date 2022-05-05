// https://api.opensea.io/api/v1/a
// https://api.opensea.io/api/v1/assets?format=json&owner=0x618bD991B158cE30EcccbBbEE2f559370A6dea1e
import { SupportedChainId } from './chains'

export const BASE_HOST = 'https://api.opensea.io'
export const RINKEBY_BASE_HOST = 'https://testnets-api.opensea.io'

export const BASE_PATH = `${BASE_HOST}/api/v1`
export const RINKEBY_BASE_PATH = `${RINKEBY_BASE_HOST}/api/v1`

export function assets(chainId: number | undefined, owner: string): string {
  if (chainId === SupportedChainId.RINKEBY) {
    return `${RINKEBY_BASE_PATH}/assets?format=json&owner=${owner}`
  }
  return `${BASE_PATH}/assets?format=json&owner=${owner}`
}
