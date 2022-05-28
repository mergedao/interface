import { nanoid } from '@reduxjs/toolkit'
import { TokenList } from '@uniswap/token-lists'
import { useCallback } from 'react'
import { useAppDispatch } from 'state/hooks'

import { getNetworkLibrary } from '../connectors'
import { fetchTokenList } from '../state/lists/actions'
import { fetchNFTokenList, Field } from '../state/merge/actions'
import { NFToken, NFTokenList } from '../state/merge/reducer'
import getNFTokenList from '../utils/getNFTokenList'
import getTokenList from '../utils/getTokenList'
import resolveENSContentHash from '../utils/resolveENSContentHash'
import useMatterAddress from './useMatterAddress'
import { useActiveWeb3React } from './web3'

export function useFetchListCallback(): (listUrl: string, sendDispatch?: boolean) => Promise<TokenList> {
  const { chainId, library } = useActiveWeb3React()
  const dispatch = useAppDispatch()

  const ensResolver = useCallback(
    async (ensName: string) => {
      if (!library || chainId !== 1) {
        const networkLibrary = getNetworkLibrary()
        const network = await networkLibrary.getNetwork()
        if (networkLibrary && network.chainId === 1) {
          return resolveENSContentHash(ensName, networkLibrary)
        }
        throw new Error('Could not construct mainnet ENS resolver')
      }
      return resolveENSContentHash(ensName, library)
    },
    [chainId, library]
  )

  // note: prevent dispatch if using for list search or unsupported list
  return useCallback(
    async (listUrl: string, sendDispatch = true) => {
      const requestId = nanoid()
      sendDispatch && dispatch(fetchTokenList.pending({ requestId, url: listUrl }))
      return getTokenList(listUrl, ensResolver)
        .then((tokenList) => {
          sendDispatch && dispatch(fetchTokenList.fulfilled({ url: listUrl, tokenList, requestId }))
          return tokenList
        })
        .catch((error) => {
          console.debug(`Failed to get list at url ${listUrl}`, error)
          sendDispatch && dispatch(fetchTokenList.rejected({ url: listUrl, requestId, errorMessage: error.message }))
          throw error
        })
    },
    [dispatch, ensResolver]
  )
}

export function useFetchNFTListCallback(): (
  field: Field.INPUT | Field.OUTPUT,
  nftUrl: string,
  sendDispatch?: boolean
) => Promise<NFTokenList> {
  // const { chainId, library } = useActiveWeb3React()
  const dispatch = useAppDispatch()
  const mattterAddress = useMatterAddress()

  // const ensResolver = useCallback(
  //   async (ensName: string) => {
  //     if (!library || chainId !== 1) {
  //       const networkLibrary = getNetworkLibrary()
  //       const network = await networkLibrary.getNetwork()
  //       if (networkLibrary && network.chainId === 1) {
  //         return resolveENSContentHash(ensName, networkLibrary)
  //       }
  //       throw new Error('Could not construct mainnet ENS resolver')
  //     }
  //     return resolveENSContentHash(ensName, library)
  //   },
  //   [chainId, library]
  // )

  // note: prevent dispatch if using for list search or unsupported list
  return useCallback(
    async (field: Field.INPUT | Field.OUTPUT, nftUrl: string, sendDispatch = true) => {
      const requestId = nanoid()
      sendDispatch && dispatch(fetchNFTokenList.pending({ field, requestId, url: nftUrl }))
      return getNFTokenList(nftUrl)
        .then((tokenList) => {
          // nftoken list, 需要重新格式化
          console.log('从opensea 获取nft 列表', tokenList)
          const finalTokens: NFToken[] = tokenList.tokens.map((token) => {
            return {
              ...token,
              isMatter: token.contract.toLowerCase() === mattterAddress.toLowerCase(),
            } as NFToken
          })
          // console.log('格式化后的nft 列表', finalTokens, mattterAddress)

          const finalTokenList = {
            ...tokenList,
            tokens: finalTokens,
          }
          // tokenList.tokens = finalTokens
          sendDispatch &&
            dispatch(fetchNFTokenList.fulfilled({ field, url: nftUrl, tokenList: finalTokenList, requestId }))
          return finalTokenList
        })
        .catch((error) => {
          console.debug(`Failed to get list at url ${nftUrl}`, error)
          sendDispatch &&
            dispatch(fetchNFTokenList.rejected({ field, url: nftUrl, requestId, errorMessage: error.message }))
          throw error
        })
    },
    [dispatch]
  )
}

// export function fetchNFTListCallback(): (
//   field: Field,
//   nftUrl: string,
//   dispatch: AppDispatch,
//   sendDispatch?: boolean
// ) => Promise<NFTokenList> {
//   // const { chainId, library } = useActiveWeb3React()
//   // const dispatch = useAppDispatch()

//   // const ensResolver = async (ensName: string) => {
//   //   if (!library || chainId !== 1) {
//   //     const networkLibrary = getNetworkLibrary()
//   //     const network = await networkLibrary.getNetwork()
//   //     if (networkLibrary && network.chainId === 1) {
//   //       return resolveENSContentHash(ensName, networkLibrary)
//   //     }
//   //     throw new Error('Could not construct mainnet ENS resolver')
//   //   }
//   //   return resolveENSContentHash(ensName, library)
//   // }

//   // note: prevent dispatch if using for list search or unsupported list
//   return async function (field: Field, nftUrl: string, dispatch, sendDispatch = true) {
//     const requestId = nanoid()
//     sendDispatch && dispatch(fetchNFTokenList.pending({ field, requestId, url: nftUrl }))
//     return getNFTokenList(nftUrl)
//       .then((tokenList) => {
//         // nftoken list, 需要重新格式化
//         console.log('从opensea 获取nft 列表', tokenList)
//         sendDispatch && dispatch(fetchNFTokenList.fulfilled({ field, url: nftUrl, tokenList, requestId }))
//         return tokenList
//       })
//       .catch((error) => {
//         console.debug(`Failed to get list at url ${nftUrl}`, error)
//         sendDispatch &&
//           dispatch(fetchNFTokenList.rejected({ field, url: nftUrl, requestId, errorMessage: error.message }))
//         throw error
//       })
//   }
// }
