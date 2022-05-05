// import { nanoid } from '@reduxjs/toolkit'
import { assets } from 'constants/opensea'

import { Field } from '../state/merge/actions'
// import { useCallback } from 'react'
import { NFTokenList } from '../state/merge/reducer'
// import getNFTokenList from '../utils/getNFTokenList'
import { useFetchNFTListCallback } from './useFetchListCallback'
import { useActiveWeb3React } from './web3'

type fn = () => Promise<NFTokenList>

export function useFetchCurrentNFT(): [fn] {
  // const {} = useActiveWeb3React();
  const { account, chainId, library } = useActiveWeb3React()
  const fetchNFT = useFetchNFTListCallback()
  const doFetchNFT = () => {
    if (account) {
      return fetchNFT(Field.INPUT, assets(chainId, account), true)
    }
    return Promise.reject(new Error('no account'))
  }
  return [doFetchNFT]
}
