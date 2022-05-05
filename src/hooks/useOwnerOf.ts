// import { namehash } from '@ethersproject/hash'
import { useMemo } from 'react'

import { useSingleCallResult } from '../state/multicall/hooks'
// import isZero from '../utils/isZero'
import { useMerge } from './useContract'

/**
 * Does a lookup for an ENS name to find its address.
 */
export default function useOwnerOf(tokenId: string | undefined): { loading: boolean; address: string | null } {
  const mergeContract = useMerge()
  const ownerOfArgument = useMemo(() => {
    if (!tokenId) return [undefined]
    return [tokenId]
  }, [tokenId])
  const ownerAddress = useSingleCallResult(mergeContract, 'ownerOf', ownerOfArgument)
  const resolverAddressResult = ownerAddress.result?.[0]
  // const resolverContract = useENSResolverContract(
  //   resolverAddressResult && !isZero(resolverAddressResult) ? resolverAddressResult : undefined,
  //   false
  // )
  // const addr = useSingleCallResult(resolverContract, 'addr', ensNodeArgument)
  return {
    address: resolverAddressResult ?? null,
    loading: ownerAddress.loading,
  }
}
