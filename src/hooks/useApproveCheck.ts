import { useWeb3React } from '@web3-react/core'
import { useMemo } from 'react'

import { MERGE_ADDRESSES } from '../constants/addresses'
import { useSingleCallResult } from '../state/multicall/hooks'
// import isZero from '../utils/isZero'
import { useERC721Contract } from './useContract'

/**
 * check is approved
 */
export default function useApproveCheck(
  tokenId: string | undefined,
  nftAddress?: string
): {
  loading: boolean
  address: string
  result: boolean
} {
  // const mergeContract = useMerge()

  const ownerOfArgument = useMemo(() => {
    if (!tokenId) return [undefined]
    return [tokenId]
  }, [tokenId])

  // console.log('当前tokenId：', tokenId)

  const erc721Contract = useERC721Contract(nftAddress)
  const { chainId } = useWeb3React()

  const ownerAddress = useSingleCallResult(erc721Contract, 'getApproved', ownerOfArgument)
  const resolverAddressResult = ownerAddress.result?.[0]

  // const resolverContract = useENSResolverContract(
  //   resolverAddressResult && !isZero(resolverAddressResult) ? resolverAddressResult : undefined,
  //   false
  // )
  // const addr = useSingleCallResult(resolverContract, 'addr', ensNodeArgument)

  return {
    address: resolverAddressResult,
    result: chainId ? resolverAddressResult === MERGE_ADDRESSES[chainId] : false,
    loading: ownerAddress.loading,
  }
}
