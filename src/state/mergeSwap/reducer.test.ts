import { createStore, Store } from 'redux'

import { Field, selectCurrency } from './actions'
import reducer, { SwapState } from './reducer'

describe('swap reducer', () => {
  let store: Store<SwapState>

  beforeEach(() => {
    store = createStore(reducer, {
      [Field.OUTPUT]: { currencyId: '' },
      [Field.INPUT]: { currencyId: '' },
      [Field.OUTPUT_NFT]: { tokenID: 0 },
      [Field.INPUT_NFT]: { tokenID: 0 },
      typedValue: '',
      independentField: Field.INPUT,
      recipient: null,
    })
  })

  describe('selectToken', () => {
    it('changes token', () => {
      store.dispatch(
        selectCurrency({
          field: Field.OUTPUT,
          currencyId: '0x0000',
        })
      )

      expect(store.getState()).toEqual({
        [Field.OUTPUT]: { currencyId: '0x0000' },
        [Field.INPUT]: { currencyId: '' },
        [Field.OUTPUT_NFT]: { tokenID: 0 },
        [Field.INPUT_NFT]: { tokenID: 0 },
        typedValue: '',
        independentField: Field.INPUT,
        recipient: null,
      })
    })
  })
})
