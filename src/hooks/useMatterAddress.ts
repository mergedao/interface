import { useWeb3React } from '@web3-react/core'
import { useMemo } from 'react'

import { MATTER_ADDRESSES } from '../constants/addresses'

export default function useMatterAddress() {
  // 获取chainID
  const { chainId } = useWeb3React()

  const finalChainId = useMemo(() => {
    return chainId ? chainId : 1
  }, [chainId])

  return MATTER_ADDRESSES[finalChainId] ?? null
}
