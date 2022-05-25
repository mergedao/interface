import { Trans } from '@lingui/macro'
import { Currency, CurrencyAmount, Percent, Token } from '@uniswap/sdk-core'
import { Pair } from '@uniswap/v2-sdk'
// import { AutoColumn } from 'components/Column'
// import {
//   LoadingOpacityContainer,
//   // loadingOpacityMixin
// } from 'components/Loader/styled'
import { darken, transparentize } from 'polished'
import { ReactNode, useCallback, useMemo, useState } from 'react'
import { NFToken } from 'state/merge/reducer'
// import { Lock } from 'react-feather'
import styled from 'styled-components/macro'

import darkEmptyImg from '../../assets/images/default_pic_dark.png'
import emptyImg from '../../assets/images/default_pic_dark.png'
// import { formatCurrencyAmount } from 'utils/formatCurrencyAmount'
import { ReactComponent as DropDown } from '../../assets/images/dropdown.svg'
import useTheme from '../../hooks/useTheme'
import { useActiveWeb3React } from '../../hooks/web3'
import { useCurrencyBalance } from '../../state/wallet/hooks'
import { ButtonGray } from '../Button'
// import CurrencyLogo from '../CurrencyLogo'
// import { Input as NumericalInput } from '../NumericalInput'
import { RowFixed } from '../Row'
// import CurrencySearchModal from '../SearchModal/CurrencySearchModal'

const SelectPanel = styled.div<{ hideInput?: boolean }>`
  ${({ theme }) => theme.flexColumnNoWrap}
  position: relative;
  border-radius: ${({ hideInput }) => (hideInput ? '16px' : '20px')};
  background-color: ${({ theme, hideInput }) => (hideInput ? 'transparent' : theme.bg2)};
  z-index: 1;
  width: ${({ hideInput }) => (hideInput ? '100%' : 'initial')};
  height: 100%;
`

const FixedContainer = styled.div<{ top?: string }>`
  width: 100%;
  height: 100%;
  position: absolute;
  border-radius: 20px;
  // background-color: ${({ theme }) => theme.bg1};
  opacity: 0.95;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  top: ${({ top }) => top || '0'};
`

const NFTFixedContainer = styled.div<{ top?: string }>`
  width: 100%;
  height: auto;
  position: absolute;
  border-radius: 20px;
  // background-color: ${({ theme }) => theme.bg1};
  opacity: 0.95;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  top: ${({ top }) => top || '0'};
`

const Container = styled.div<{ hideInput: boolean }>`
  border-radius: ${({ hideInput }) => (hideInput ? '16px' : '20px')};
  border: 1px solid ${({ theme, hideInput }) => (hideInput ? ' transparent' : theme.bg2)};
  background-color: ${({ theme }) => theme.bg2};
  width: ${({ hideInput }) => (hideInput ? '100%' : 'initial')};
  height: ${({ hideInput }) => (hideInput ? '100%' : 'initial')};
  :focus,
  :hover {
    border: 1px solid ${({ theme, hideInput }) => (hideInput ? ' transparent' : theme.bg3)};
  }
`

const CurrencySelect = styled(ButtonGray)<{ visible: boolean; selected: boolean; hideInput?: boolean }>`
  visibility: ${({ visible }) => (visible ? 'visible' : 'hidden')};
  align-items: center;
  font-size: 12px;
  font-weight: 200;
  background-color: ${({ selected, theme }) => transparentize(0.3, selected ? theme.bg2 : theme.primary1)};
  color: ${({ selected, theme }) => (selected ? theme.text1 : theme.white)};
  border-radius: 1rem 1rem 0 0;
  box-shadow: ${({ selected }) => (selected ? 'none' : '0px 6px 10px rgba(0, 0, 0, 0.075)')};
  box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.075);
  outline: none;
  cursor: pointer;
  user-select: none;
  border: none;
  height: ${({ hideInput }) => (hideInput ? '2rem' : '2.4rem')};
  width: ${({ hideInput }) => (hideInput ? '100%' : 'initial')};
  padding: 0 8px;
  justify-content: space-between;
  margin-right: ${({ hideInput }) => (hideInput ? '0' : '12px')};
  :focus,
  :hover {
    background-color: ${({ selected, theme }) => transparentize(0.3, selected ? theme.bg2 : theme.primary1)};
    // background-color: ${({ selected, theme }) => (selected ? theme.bg2 : theme.primary1)};
  }
`

const SelectRow = styled.div<{ selected: boolean }>`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: start;
  justify-content: center;
  padding: ${({ selected }) => (selected ? ' 1rem 1rem 0.75rem 1rem' : '1rem 1rem 0.75rem 1rem')};
`

const StyledNFTImage = styled.img<{ height: string; width: string }>`
  width: ${({ height }) => height};
  height: ${({ width }) => width};
  // background-color: ${({ theme }) => theme.bg2};
  box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.075);
  border-radius: 24px;
`

const NFTView = styled(StyledNFTImage)<{ isEmpty: boolean }>`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  justify-content: center;
  padding: 0.4rem;
  object-fit: ${({ isEmpty }) => (isEmpty ? 'contain' : 'cover')};
`

const LabelRow = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  color: ${({ theme }) => theme.text1};
  font-size: 0.75rem;
  line-height: 1rem;
  padding: 0 1rem 1rem;
  span:hover {
    cursor: pointer;
    color: ${({ theme }) => darken(0.2, theme.text2)};
  }
`

const FiatRow = styled(LabelRow)`
  justify-content: flex-end;
`

const Aligner = styled.span`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`

const StyledDropDown = styled(DropDown)<{ selected: boolean }>`
  margin: 0 0.25rem 0 0.35rem;
  height: 35%;

  path {
    stroke: ${({ selected, theme }) => (selected ? theme.text1 : theme.white)};
    stroke-width: 1.5px;
  }
`

const StyledTokenName = styled.span<{ active?: boolean }>`
  ${({ active }) => (active ? '  margin: 0 0.25rem 0 0.25rem;' : '  margin: 0 0.25rem 0 0.25rem;')}
  font-size:  ${({ active }) => (active ? '18px' : '18px')};
`

const StyledBalanceMax = styled.button<{ disabled?: boolean }>`
  background-color: transparent;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
  color: ${({ theme }) => theme.primaryText1};
  opacity: ${({ disabled }) => (!disabled ? 1 : 0.4)};
  pointer-events: ${({ disabled }) => (!disabled ? 'initial' : 'none')};
  margin-left: 0.25rem;

  :focus {
    outline: none;
  }

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    margin-right: 0.5rem;
  `};
`

// const StyledNumericalInput = styled(NumericalInput)<{ $loading: boolean }>`
//   ${loadingOpacityMixin}
// `

interface CurrencyInputPanelProps {
  value: string
  onUserInput: (value: string) => void
  onMax?: () => void
  showMaxButton: boolean
  label?: ReactNode
  onCurrencySelect?: (currency: Currency) => void
  currency?: Currency | null
  nft?: NFToken | null
  hideBalance?: boolean
  pair?: Pair | null
  hideInput?: boolean
  otherCurrency?: Currency | null
  otherNft?: NFToken | null
  fiatValue?: CurrencyAmount<Token> | null
  priceImpact?: Percent
  id: string
  showCommonBases?: boolean
  showCurrencyAmount?: boolean
  disableNonToken?: boolean
  renderBalance?: (amount: CurrencyAmount<Currency>) => ReactNode
  locked?: boolean
  loading?: boolean
  tokenList?: NFToken[]
}

export default function NFTSelectPanel({
  value,
  onUserInput,
  onMax,
  showMaxButton,
  onCurrencySelect,
  currency,
  nft,
  tokenList,
  otherCurrency,
  otherNft,
  id,
  showCommonBases,
  showCurrencyAmount,
  disableNonToken,
  renderBalance,
  fiatValue,
  priceImpact,
  hideBalance = false,
  // pair = null, // used for double token logo
  hideInput = false,
  // locked = true,
  loading = false,
  ...rest
}: CurrencyInputPanelProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const { account } = useActiveWeb3React()
  const selectedCurrencyBalance = useCurrencyBalance(account ?? undefined, currency ?? undefined)
  const theme = useTheme()

  const emptyUrl = useMemo(() => {
    return theme.darkMode ? darkEmptyImg : emptyImg
  }, [theme])

  const tokenId = useMemo(() => {
    return nft?.tokenId ?? ''
  }, [nft])

  const handleDismissSearch = useCallback(() => {
    setModalOpen(false)
  }, [setModalOpen])

  return (
    <SelectPanel id={id} hideInput={hideInput} {...rest}>
      {/* {locked && (
        <FixedContainer>
          <AutoColumn gap="sm" justify="center">
            <Lock />
            <TYPE.label fontSize="12px" textAlign="center" padding="0 12px">
              <Trans>The market price is outside your specified price range. Single-asset deposit only.</Trans>
            </TYPE.label>
          </AutoColumn>
        </FixedContainer>
      )} */}
      <NFTFixedContainer>
        <Container hideInput={hideInput} style={{ background: 'transparent' }}>
          <SelectRow style={hideInput ? { padding: '0.4rem', borderRadius: '10px' } : {}} selected={true}>
            <CurrencySelect
              visible={true}
              selected={true}
              hideInput={hideInput}
              className="open-currency-select-button"
              onClick={() => {
                // if (onCurrencySelect) {
                //   setModalOpen(true)
                // }
              }}
            >
              <Aligner>
                <RowFixed title={`#${tokenId}`}>
                  {/* {currency ? (
                    <CurrencyLogo style={{ marginRight: '0.5rem' }} currency={currency} size={'24px'} />
                  ) : null} */}
                  <StyledTokenName className="token-symbol-container" active={true}>
                    #
                    {(tokenId.length > 20
                      ? tokenId.slice(0, 4) + '...' + tokenId.slice(tokenId.length - 5, tokenId.length)
                      : tokenId) || <Trans>Empty</Trans>}
                  </StyledTokenName>
                </RowFixed>
              </Aligner>
            </CurrencySelect>
          </SelectRow>
        </Container>
      </NFTFixedContainer>
      <Container hideInput={hideInput}>
        {/* {tokenList &&
          tokenList.map((token) => {
            return <NFTView key={token.tokenId} width="100%" height="100%" src={token.tokenURI}></NFTView>
          })} */}
        <NFTView isEmpty={!nft?.tokenURI} width="100%" height="100%" src={nft?.tokenURI || emptyUrl}></NFTView>
      </Container>
    </SelectPanel>
  )
}
