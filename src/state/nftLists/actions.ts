import { ActionCreatorWithPayload, createAction } from '@reduxjs/toolkit'
import { TokenList } from '@uniswap/token-lists'

export const fetchNFTokenList: Readonly<{
  pending: ActionCreatorWithPayload<{ url: string; requestId: string }>
  fulfilled: ActionCreatorWithPayload<{ url: string; tokenList: TokenList; requestId: string }>
  rejected: ActionCreatorWithPayload<{ url: string; errorMessage: string; requestId: string }>
}> = {
  pending: createAction('lists/fetchNFTokenList/pending'),
  fulfilled: createAction('lists/fetchNFTokenList/fulfilled'),
  rejected: createAction('lists/fetchNFTokenList/rejected'),
}

// add and remove from list options
export const addList = createAction<string>('lists/addList')
export const removeList = createAction<string>('lists/removeList')

// select which lists to search across from loaded lists
export const enableList = createAction<string>('lists/enableList')
export const disableList = createAction<string>('lists/disableList')

// versioning
export const acceptListUpdate = createAction<string>('lists/acceptListUpdate')
