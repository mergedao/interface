// eslint-disable-next-line no-restricted-imports
import { t } from '@lingui/macro'
import { Currency, CurrencyAmount, Percent, Token } from '@uniswap/sdk-core'
import { Pair } from '@uniswap/v2-sdk'
import { useNFTApproveCallback } from 'hooks/useNFTApproveCallback'
import { useNFTDeMergeCallback } from 'hooks/useNFTDemergeCallback'
// import { AutoColumn } from 'components/Column'
import { darken, transparentize } from 'polished'
import { ReactNode, useCallback, useEffect, useState } from 'react'
import { CheckCircle } from 'react-feather'
import { useUpdateApprovedStatus } from 'state/merge/hooks'
import { NFToken } from 'state/merge/reducer'
import styled from 'styled-components/macro'

import { ReactComponent as DropDown } from '../../assets/images/dropdown.svg'
import useApproveCheck from '../../hooks/useApproveCheck'
import useMatterAddress from '../../hooks/useMatterAddress'
import useTheme from '../../hooks/useTheme'
import { useActiveWeb3React } from '../../hooks/web3'
import { useCurrencyBalance } from '../../state/wallet/hooks'
import { ButtonGray, ButtonPrimary } from '../Button'
import ToolTipModal from '../merge/ToolTipModal'
import { AutoRow } from '../Row'
// import { Input as NumericalInput } from '../NumericalInput'
// import CurrencySearchModal from '../SearchModal/CurrencySearchModal'

const SelectPanel = styled.div<{ hideInput?: boolean }>`
  ${({ theme }) => theme.flexColumnNoWrap}
  position: relative;
  border-radius: ${({ hideInput }) => (hideInput ? '16px' : '20px')};
  background-color: ${({ theme, hideInput }) => (hideInput ? 'transparent' : theme.bg2)};
  z-index: 1;
  width: ${({ hideInput }) => (hideInput ? '100%' : 'initial')};
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
  // position: absolute;
  border-radius: 20px;
  // background-color: ${({ theme }) => theme.bg1};
  opacity: 0.95;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    // padding: 1rem;
    justify-content: space-around;
  `};
  z-index: 2;
  top: ${({ top }) => top || '0'};
`

const Container = styled.div<{ hideInput: boolean }>`
  border-radius: ${({ hideInput }) => (hideInput ? '16px' : '20px')};
  border: 1px solid ${({ theme, hideInput }) => (hideInput ? ' transparent' : theme.bg2)};
  background-color: ${({ theme }) => theme.bg1};
  width: ${({ hideInput }) => (hideInput ? '100%' : 'initial')};
  // display: flex;
  // flex-wrap: wrap;
  // justify-content: space-around;
  min-width: 200px;
  max-width: 240px;
  height: 360px;
  overflow: hidden;
  margin: 1rem;
  position: relative;
  box-shadow: 0px 8px 20px ${({ theme }) => theme.text4};
  :focus,
  :hover {
    border: 1px solid ${({ theme, hideInput }) => (hideInput ? ' transparent' : theme.bg3)};
  }
`

const CurrencySelect = styled(ButtonGray)<{ visible: boolean; selected: boolean; hideInput?: boolean }>`
  visibility: ${({ visible }) => (visible ? 'visible' : 'hidden')};
  align-items: center;
  font-size: 24px;
  font-weight: 500;
  background-color: ${({ selected, theme }) => (selected ? theme.bg0 : theme.primary1)};
  color: ${({ selected, theme }) => (selected ? theme.text1 : theme.white)};
  border-radius: 16px;
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
    background-color: ${({ selected, theme }) => (selected ? theme.bg2 : darken(0.05, theme.primary1))};
  }
`

const SelectRow = styled.div<{ selected: boolean }>`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: start;
  justify-content: center;
  height: 356px;
  overflow: hidden;
  padding: ${({ selected }) => (selected ? ' 1rem 1rem 0.75rem 1rem' : '1rem 1rem 0.75rem 1rem')};
`

const StyledNFTImage = styled.img<{ height: string; width: string }>`
  width: ${({ height }) => height};
  height: ${({ width }) => width};
  border-radius: 10px;
`

const NFTView = styled(StyledNFTImage)`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  justify-content: center;
  // margin: 1rem;
  min-width: 100px;
  min-height: 200px;
  object-fit: cover;
  // padding: 1rem 1rem 0.75rem 1rem;
  width: 100%;
  img[src=''] {
    display: none;
  }
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

const StyledMask = styled.div<{ Yin?: boolean; visible?: boolean }>`
  background-color: ${({ Yin, theme }) => transparentize(0.3, theme.text1)};
  color: ${({ theme }) => theme.primary1};
  font-size: 1rem;
  font-weight: bold;
  opacity: 1;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: ${({ visible }) => (visible ? 'initial' : 'none')};
`

const StyledMaskWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  justify-content: center;
  // align-items: center;
`

const StyledApproved = styled.div`
  position: absolute;
  bottom: 13px;
  right: 16px;
  font-size: 12px;
  padding: 2px;
  cursor: pointer;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.text5};
  background: ${({ theme }) => theme.bg1};
`

const StyledMergeButton = styled(ButtonPrimary)`
  position: absolute;
  bottom: 13px;
  left: 16px;
  font-size: 12px;
  padding: 2px;
  cursor: pointer;
  border-radius: 6px;
  width: auto;
`

const StyledOpenSeaWrapper = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  width: 24px;
  height: 24px;
  img {
    width: 100%;
    height: 100%;
  }
`

const StyleNoNFT = styled.div`
  padding: 1rem 1rem 4rem 1rem;
  text-align: center;
  width: 100%;
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
  onNFTSelect?: (nft: NFToken) => void
  currency?: Currency | null
  yin?: NFToken | null
  yang?: NFToken | null
  hideBalance?: boolean
  pair?: Pair | null
  hideInput?: boolean
  otherCurrency?: Currency | null
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

function ShowApprovStatus({ token }: { token: NFToken }) {
  // const result = useOwnerOf(yin?.tokenId)
  const approveResult = useApproveCheck(token?.tokenId, token?.contract)
  const updateTokenApproveCall = useUpdateApprovedStatus()

  const [status, approveCall] = useNFTApproveCallback(token)

  const approveToken = useCallback(
    (evt) => {
      if (approveResult.result) {
        return
      }
      // 调用授权
      approveCall()
      // 组织时间传播
      evt.stopPropagation()
    },
    [approveCall, approveResult.result]
  )

  useEffect(() => {
    updateTokenApproveCall({
      tokenId: token.tokenId,
      status: approveResult.result,
    })
  }, [token.tokenId, approveResult.loading, approveResult.result])

  useEffect(() => {
    console.log('获取approve结果:', approveResult)
    updateTokenApproveCall({
      tokenId: token.tokenId,
      status: approveResult.result,
    })
  }, [token?.tokenId, approveResult.loading])

  return <StyledApproved onClick={approveToken}>{approveResult.result ? 'approved' : 'unapproved'}</StyledApproved>
}

function DemergeButton({ token, openDialog }: { token: NFToken; openDialog: (msg: string) => void }) {
  // const result = useOwnerOf(yin?.tokenId)
  // const approveResult = useApproveCheck(token?.tokenId, token?.contract)
  // const updateTokenApproveCall = useUpdateApprovedStatus()

  const [status, demergeCall] = useNFTDeMergeCallback(token)

  const matterAddress = useMatterAddress()

  const demergeHandle = useCallback(
    (evt) => {
      evt.stopPropagation()
      if (!token || !token.approved || token.contract.toLowerCase() !== matterAddress.toLowerCase()) {
        console.error('merge stopped', token)
        return
      }
      // 调用授权
      demergeCall()
        .then(() => {
          openDialog(
            t`The token: #${token.tokenId} demerge request has been submitted, please wait patiently or refresh the page.`
          )
        })
        .catch((err) => {
          console.error(err)
        })
    },
    [token, matterAddress, openDialog, demergeCall]
  )

  // useEffect(() => {
  //   console.log(
  //     '当前token:',
  //     matterAddress.toLowerCase() === token.contract.toLowerCase(),
  //     token.contract,
  //     matterAddress,
  //     token
  //   )
  // }, [token, matterAddress])

  // useEffect(() => {
  //   console.log('获取approve结果:', approveResult)
  //   updateTokenApproveCall({
  //     tokenId: token.tokenId,
  //     status: approveResult.result,
  //   })
  // }, [token?.tokenId, approveResult.loading])

  return token.contract.toLowerCase() === matterAddress.toLowerCase() && token.approved === true ? (
    <StyledMergeButton onClick={demergeHandle}>demerge</StyledMergeButton>
  ) : null
}

export default function NFTListPanel({
  value,
  onUserInput,
  onMax,
  showMaxButton,
  onCurrencySelect,
  onNFTSelect,
  currency,
  tokenList,
  otherCurrency,
  id,
  showCommonBases,
  showCurrencyAmount,
  disableNonToken,
  renderBalance,
  fiatValue,
  priceImpact,
  yin,
  yang,
  hideBalance = true,
  // pair = null, // used for double token logo
  hideInput = true,
  // locked = true,
  loading = false,
  ...rest
}: CurrencyInputPanelProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const { account } = useActiveWeb3React()
  const selectedCurrencyBalance = useCurrencyBalance(account ?? undefined, currency ?? undefined)
  const theme = useTheme()

  const [tipContent, setTipContent] = useState<string>(t`cannot be merged without approval.`)

  // const [isOpen, setIsOpen] = useState(false)

  // const tipContentDismiss = useCallback(() => {
  //   setModalOpen(false)
  // }, [setModalOpen, isOpen])

  const handleDismissTip = useCallback(() => {
    setModalOpen(false)
  }, [setModalOpen])

  const handleOpenDialog = useCallback(
    (msg) => {
      setTipContent(msg)
      setModalOpen(true)
    },
    [setModalOpen, setTipContent]
  )

  const handleNFTSelect = useCallback(
    (token: NFToken) => {
      if (!token || !token.approved) {
        setModalOpen(true)
        return
      }
      // console.log('current nft approved status:', token.approved)
      // alert(`You have selected ${token.tokenId} from ${token.tokenName}`)
      console.log('current nft Select:', token)
      onNFTSelect && onNFTSelect(token)
    },
    [onNFTSelect]
  )

  return (
    <SelectPanel id={id} hideInput={hideInput} {...rest}>
      <NFTFixedContainer>
        {tokenList && tokenList.length > 0 ? (
          tokenList.map((token, idx) => {
            return (
              <Container
                onClick={() => {
                  handleNFTSelect(token)
                }}
                key={token.tokenId + idx}
                hideInput={hideInput}
              >
                {token.openseaUrl && (
                  <StyledOpenSeaWrapper>
                    <a
                      onClick={(evt) => {
                        evt.stopPropagation()
                      }}
                      target="_blank"
                      href={token.openseaUrl}
                      rel="noreferrer"
                    >
                      <img src="https://opensea.io/static/images/logos/opensea.svg" alt={token.tokenName} />
                    </a>
                  </StyledOpenSeaWrapper>
                )}
                <SelectRow style={{ borderRadius: '8px' }} selected={!onCurrencySelect}>
                  <NFTView width="100%" height="auto" src={token.tokenURI}></NFTView>
                  {token ? <ShowApprovStatus token={token} /> : null}
                  {token ? <DemergeButton token={token} openDialog={handleOpenDialog} /> : null}
                </SelectRow>
                <StyledMask
                  Yin={token.contract === yin?.contract && token.tokenId === yin?.tokenId}
                  visible={
                    (token.contract === yin?.contract && token.tokenId === yin?.tokenId) ||
                    (token.contract === yang?.contract && token.tokenId === yang?.tokenId)
                  }
                >
                  <StyledMaskWrapper>
                    <AutoRow justify="center" padding="0.5rem">
                      <CheckCircle size="2rem" />
                    </AutoRow>
                    <AutoRow justify="center">
                      {token.tokenId === yin?.tokenId && <div>Yin</div>}
                      {token.tokenId === yang?.tokenId && <div>Yang</div>}
                    </AutoRow>
                  </StyledMaskWrapper>
                </StyledMask>
              </Container>
            )
          })
        ) : (
          <StyleNoNFT>no nft found.</StyleNoNFT>
        )}
      </NFTFixedContainer>
      <ToolTipModal onDismiss={handleDismissTip} isOpen={modalOpen}>
        {tipContent}
      </ToolTipModal>
      {/* {onCurrencySelect && (
        <NFCurrencySearchModal
          isOpen={modalOpen}
          onDismiss={handleDismissSearch}
          onCurrencySelect={onCurrencySelect}
          selectedCurrency={currency}
          otherSelectedCurrency={otherCurrency}
          showCommonBases={showCommonBases}
          showCurrencyAmount={showCurrencyAmount}
          disableNonToken={disableNonToken}
        />
      )} */}
    </SelectPanel>
  )
}
