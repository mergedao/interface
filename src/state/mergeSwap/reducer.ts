import { createReducer } from '@reduxjs/toolkit'
import { parsedQueryString } from 'hooks/useParsedQueryString'

import { Field, replaceSwapState, selectCurrency, setRecipient, switchCurrencies, typeInput } from './actions'
import { queryParametersToSwapState } from './hooks'
import { WrappedTokenInfo } from './wrappedTokenInfo'

export interface NFToken {
  readonly tokenId: number
  readonly tokenURI: string
  readonly tokenName: string
  readonly description: string
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

export interface MergeSwapState {
  readonly independentField: Field.INPUT | Field.OUTPUT
  readonly typedValue: string
  readonly [Field.INPUT]: {
    readonly currencyId: string | undefined | null
    readonly nftList?: NFToken[]
  }
  readonly [Field.OUTPUT]: {
    readonly currencyId: string | undefined | null
    readonly nftList?: NFToken[]
  }
  readonly [Field.INPUT_NFT]: {
    readonly tokenId: number | undefined | null
  }
  readonly [Field.OUTPUT_NFT]: {
    readonly tokenId: number | undefined | null
  }
  // the typed recipient address or ENS name, or null if swap should go to sender
  readonly recipient: string | null
}

const initialState: MergeSwapState = queryParametersToSwapState(parsedQueryString())

export default createReducer<MergeSwapState>(initialState, (builder) =>
  builder
    .addCase(
      replaceSwapState,
      (
        state,
        { payload: { typedValue, recipient, field, inputCurrencyId, outputCurrencyId, inputTokenId, outputTokenId } }
      ) => {
        return {
          [Field.INPUT]: {
            currencyId: inputCurrencyId ?? null,
          },
          [Field.OUTPUT]: {
            currencyId: outputCurrencyId ?? null,
          },
          [Field.INPUT_NFT]: {
            tokenId: inputTokenId ?? null,
          },
          [Field.OUTPUT_NFT]: {
            tokenId: outputTokenId ?? null,
          },
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
          independentField: state.independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT,
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
    .addCase(switchCurrencies, (state) => {
      return {
        ...state,
        independentField: state.independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT,
        [Field.INPUT]: { currencyId: state[Field.OUTPUT].currencyId },
        [Field.OUTPUT]: { currencyId: state[Field.INPUT].currencyId },
      }
    })
    .addCase(typeInput, (state, { payload: { field, typedValue } }) => {
      return {
        ...state,
        independentField: field,
        typedValue,
      }
    })
    .addCase(setRecipient, (state, { payload: { recipient } }) => {
      state.recipient = recipient
    })
)
