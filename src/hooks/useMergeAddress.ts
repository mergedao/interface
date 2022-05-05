import { useWeb3React } from '@web3-react/core'
import { useMemo } from 'react'

import { MERGE_ADDRESSES } from '../constants/addresses'

export default function useMergeAddress() {
  // 获取chainID
  const { chainId } = useWeb3React()

  const finalChainId = useMemo(() => {
    return chainId ? chainId : 1
  }, [chainId])

  return MERGE_ADDRESSES[finalChainId] ?? null
}
