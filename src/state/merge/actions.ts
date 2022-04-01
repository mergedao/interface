import { ActionCreatorWithPayload, createAction } from '@reduxjs/toolkit'

import { NFToken, NFTokenList } from './reducer'

export enum Field {
  INPUT = 'INPUT',
  OUTPUT = 'OUTPUT',
  YIN_NFT = 'YIN_NFT',
  YANG_NFT = 'YANG_NFT',
}

export const fetchNFTokenList: Readonly<{
  pending: ActionCreatorWithPayload<{ field: Field; url: string; requestId: string }>
  fulfilled: ActionCreatorWithPayload<{
    field: Field.INPUT | Field.OUTPUT
    url: string
    tokenList: NFTokenList
    requestId: string
  }>
  rejected: ActionCreatorWithPayload<{
    field: Field.INPUT | Field.OUTPUT
    url: string
    errorMessage: string
    requestId: string
  }>
}> = {
  pending: createAction('mergeSwap/fetchNFTTokenList/pending'),
  fulfilled: createAction('mergeSwap/fetchNFTTokenList/fulfilled'),
  rejected: createAction('mergeSwap/fetchNFTTokenList/rejected'),
}

export const selectCurrency =
  createAction<{ field: Field.INPUT | Field.OUTPUT; currencyId: string }>('mergeSwap/selectCurrency')

export const selectNFT = createAction<{ field: Field.YIN_NFT | Field.YANG_NFT; token: NFToken }>('mergeSwap/selectNFT')

export const switchCurrencies = createAction<void>('mergeSwap/switchCurrencies')
export const switchNFT = createAction<void>('mergeSwap/switchNFT')

export const typeInput = createAction<{ field: Field.INPUT | Field.OUTPUT; typedValue: string }>('mergeSwap/typeInput')
export const replaceSwapState = createAction<{
  field: Field.YIN_NFT | Field.YANG_NFT
  typedValue: string
  inputCurrencyId?: string
  outputCurrencyId?: string
  // inputTokenId?: string
  // outputTokenId?: string
  YinToken?: NFToken
  YangToken?: NFToken
  recipient: string | null
}>('mergeSwap/replaceSwapState')

export const setRecipient = createAction<{ recipient: string | null }>('mergeSwap/setRecipient')
