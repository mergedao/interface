import { createReducer } from '@reduxjs/toolkit'
import { parsedQueryString } from 'hooks/useParsedQueryString'

import {
  cleanSelect,
  fetchNFTokenList,
  Field,
  replaceSwapState,
  selectCurrency,
  selectNFT,
  setRecipient,
  switchCurrencies,
  switchNFT,
  typeInput,
  updateTokenApproveStatus,
} from './actions'
import { queryParametersToSwapState } from './hooks'
// import { WrappedTokenInfo } from './wrappedTokenInfo'

export interface NFToken {
  readonly tokenId: string
  readonly tokenURI: string
  readonly tokenName: string
  readonly description: string
  readonly contract: string
  readonly symbol: string
  readonly contractName: string
  readonly approved?: boolean // 是否授权了
  readonly openseaUrl?: string
  readonly isMatter: boolean
  // readonly byUrl: {
  //   readonly [url: string]: {
  //     readonly current: TokenList | null
  //     readonly pendingUpdate: TokenList | null
  //     readonly loadingRequestId: string | null
  //     readonly error: string | null
  //   }
  // }
  // this contains the default list of lists from the last time the updateVersion was called, i.e. the app was reloaded
  // readonly lastInitializedDefaultListOfLists?: Token[]

  // currently active lists
  // readonly activeListUrls: string[] | undefined
}
export interface NFTokenList {
  readonly name: string
  readonly timestamp: string
  readonly tokens: NFToken[]
}

export interface MergeSwapState {
  readonly independentField: Field.YIN_NFT | Field.YANG_NFT
  readonly typedValue: string
  readonly currentNFTs?: {
    readonly loadingRequestId: string | null
    readonly error: string | null
    readonly nftList?: NFToken[]
  }
  readonly [Field.INPUT]: {
    readonly currencyId: string | undefined | null
    readonly nftList?: NFToken[]
    readonly requestStatus?: {
      readonly loadingRequestId: string | null
      readonly error: string | null
    }
  }
  readonly [Field.OUTPUT]: {
    readonly currencyId: string | undefined | null
    readonly nftList?: NFToken[]
    readonly requestStatus?: {
      readonly loadingRequestId: string | null
      readonly error: string | null
    }
  }
  readonly [Field.YIN_NFT]: NFToken | null
  readonly [Field.YANG_NFT]: NFToken | null
  // the typed recipient address or ENS name, or null if swap should go to sender
  readonly recipient: string | null
}

const initialState: MergeSwapState = queryParametersToSwapState(parsedQueryString())

export default createReducer<MergeSwapState>(initialState, (builder) =>
  builder
    .addCase(fetchNFTokenList.pending, (state, { payload: { requestId } }) => {
      // const current = state.byUrl[url]?.current ?? null
      // const pendingUpdate = state[field].requestStatus ?? null

      state.currentNFTs = {
        // current,
        // pendingUpdate,
        ...state.currentNFTs,
        loadingRequestId: requestId,
        error: null,
      }
    })
    .addCase(fetchNFTokenList.fulfilled, (state, { payload: { requestId, tokenList } }) => {
      // const current = state.byUrl[url]?.current
      // const loadingRequestId = state.byUrl[url]?.loadingRequestId
      const current = tokenList.tokens

      state.currentNFTs = {
        // current,
        // pendingUpdate,
        ...state.currentNFTs,
        loadingRequestId: requestId,
        nftList: current,
        error: null,
      }
      // state[field].nftList = current
      // // no-op if update does nothing
      // if (current) {
      //   const upgradeType = getVersionUpgrade(current.version, tokenList.version)

      //   if (upgradeType === VersionUpgrade.NONE) return
      //   if (loadingRequestId === null || loadingRequestId === requestId) {
      //     state.byUrl[url] = {
      //       current,
      //       pendingUpdate: tokenList,
      //       loadingRequestId: null,
      //       error: null,
      //     }
      //   }
      // } else {
      //   // activate if on default active
      //   if (DEFAULT_ACTIVE_LIST_URLS.includes(url)) {
      //     state.activeListUrls?.push(url)
      //   }

      //   state.byUrl[url] = {
      //     current: tokenList,
      //     pendingUpdate: null,
      //     loadingRequestId: null,
      //     error: null,
      //   }
      // }
    })
    .addCase(fetchNFTokenList.rejected, (state, { payload: { field, requestId, errorMessage } }) => {
      if (state[field]?.requestStatus?.loadingRequestId !== requestId) {
        // no-op since it's not the latest request
        return
      }

      state.currentNFTs = {
        // current: state.byUrl[url].current ? state.byUrl[url].current : null,
        // pendingUpdate: null,
        loadingRequestId: null,
        error: errorMessage,
      }
    })
    .addCase(
      replaceSwapState,
      (
        state,
        { payload: { typedValue, recipient, field, inputCurrencyId, outputCurrencyId, YinToken, YangToken } }
      ) => {
        return {
          [Field.INPUT]: {
            currencyId: inputCurrencyId ?? null,
          },
          [Field.OUTPUT]: {
            currencyId: outputCurrencyId ?? null,
          },
          [Field.YIN_NFT]: YinToken ?? null,
          [Field.YANG_NFT]: YangToken ?? null,
          independentField: field,
          typedValue,
          recipient,
        }
      }
    )
    .addCase(selectCurrency, (state, { payload: { currencyId, field } }) => {
      const otherField = field === Field.INPUT ? Field.OUTPUT : Field.INPUT
      // console.log('currencyId, field', currencyId, field)
      if (currencyId === state[otherField].currencyId) {
        // the case where we have to swap the order
        return {
          ...state,
          // independentField: state.independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT,
          [field]: {
            currencyId,
          },
          [otherField]: { currencyId: state[field].currencyId },
        }
      } else {
        // the normal case
        return {
          ...state,
          [field]: { currencyId },
        }
      }
    })
    .addCase(selectNFT, (state, { payload: { field, token } }) => {
      const otherField = field === Field.YIN_NFT ? Field.YANG_NFT : Field.YIN_NFT
      // console.log('currencyId, field', currencyId, field)
      if (!token.tokenId) {
        return {
          ...state,
        }
      }
      const tokenId = token.tokenId
      if (tokenId === state[otherField]?.tokenId) {
        // the case where we have to swap the order
        return {
          ...state,
          independentField: state.independentField === Field.YIN_NFT ? Field.YANG_NFT : Field.YIN_NFT,
          [field]: {
            ...token,
            // tokenId,
          },
          [otherField]: {
            ...state[field],
            // tokenId: state[field]?.tokenId,
          },
        }
      } else {
        // the normal case
        return {
          ...state,
          independentField: state.independentField === Field.YIN_NFT ? Field.YANG_NFT : Field.YIN_NFT,
          [field]: {
            ...token,
          },
        }
      }
    })
    .addCase(switchCurrencies, (state) => {
      return {
        ...state,
        independentField: state.independentField === Field.YIN_NFT ? Field.YIN_NFT : Field.YANG_NFT,
        [Field.INPUT]: { currencyId: state[Field.OUTPUT].currencyId },
        [Field.OUTPUT]: { currencyId: state[Field.INPUT].currencyId },
      }
    })
    .addCase(switchNFT, (state) => {
      return {
        ...state,
        independentField: state.independentField === Field.YIN_NFT ? Field.YIN_NFT : Field.YANG_NFT,
        [Field.YIN_NFT]: {
          ...state[Field.YANG_NFT],
        } as NFToken,
        [Field.YANG_NFT]: {
          ...state[Field.YIN_NFT],
        } as NFToken,
      }
    })
    .addCase(typeInput, (state, { payload: { field, typedValue } }) => {
      return {
        ...state,
        // independentField: field,
        typedValue,
      }
    })
    .addCase(cleanSelect, (state, { payload }) => {
      return {
        ...state,
        // independentField: field,
        [Field.YIN_NFT]: null,
        [Field.YANG_NFT]: null,
      }
    })
    .addCase(setRecipient, (state, { payload: { recipient } }) => {
      state.recipient = recipient
    })
    .addCase(updateTokenApproveStatus, (state, { payload: { tokenId, status } }) => {
      const newList = state.currentNFTs?.nftList?.map((token) => {
        if (token.tokenId === tokenId) {
          return {
            ...token,
            approved: status,
          }
        }
        return token
      })

      return {
        ...state,
        currentNFTs: {
          ...state.currentNFTs,
          nftList: newList,
        } as {
          readonly loadingRequestId: string | null
          readonly error: string | null
          readonly nftList?: NFToken[]
        },
      }
    })
)
