import { createAction } from '@reduxjs/toolkit'

export enum Field {
  INPUT = 'INPUT',
  OUTPUT = 'OUTPUT',
  INPUT_NFT = 'INPUT_NFT',
  OUTPUT_NFT = 'INPUT_NFT',
}

export const selectCurrency =
  createAction<{ field: Field.INPUT | Field.OUTPUT; currencyId: string }>('mergeSwap/selectCurrency')
export const switchCurrencies = createAction<void>('mergeSwap/switchCurrencies')
export const typeInput = createAction<{ field: Field.INPUT | Field.OUTPUT; typedValue: string }>('mergeSwap/typeInput')
export const replaceSwapState = createAction<{
  field: Field.INPUT | Field.OUTPUT
  typedValue: string
  inputCurrencyId?: string
  outputCurrencyId?: string
  inputTokenId?: number
  outputTokenId?: number
  recipient: string | null
}>('mergeSwap/replaceSwapState')
export const setRecipient = createAction<{ recipient: string | null }>('mergeSwap/setRecipient')
