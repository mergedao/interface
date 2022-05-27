/* eslint-disable unused-imports/no-unused-imports */
// eslint-disable-next-line no-restricted-imports
import { t, Trans } from '@lingui/macro'
import { Currency, CurrencyAmount, Token, TradeType } from '@uniswap/sdk-core'
import { Trade as V2Trade } from '@uniswap/v2-sdk'
import { Trade as V3Trade } from '@uniswap/v3-sdk'
import { LoadingOpacityContainer } from 'components/Loader/styled'
import { NetworkAlert } from 'components/NetworkAlert/NetworkAlert'
import { AdvancedSwapDetails } from 'components/swap/AdvancedSwapDetails'
import { AutoRouterLogo } from 'components/swap/RouterLabel'
import SwapRoute from 'components/swap/SwapRoute'
import TradePrice from 'components/swap/TradePrice'
import UnsupportedCurrencyFooter from 'components/swap/UnsupportedCurrencyFooter'
import Tooltip, { MouseoverTooltip, MouseoverTooltipContent } from 'components/Tooltip'
import { useFetchNFTListCallback } from 'hooks/useFetchListCallback'
import { useNFTMergeCallback } from 'hooks/useNFTMergeCallback'
import JSBI from 'jsbi'
import { MouseEvent, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { CheckCircle, HelpCircle, Info, Plus } from 'react-feather'
import ReactGA from 'react-ga'
import { RouteComponentProps } from 'react-router-dom'
import { Text } from 'rebass'
import { V3TradeState } from 'state/routing/types'
import styled, { ThemeContext } from 'styled-components/macro'

import AddressInputPanel from '../../components/AddressInputPanel'
import { ButtonConfirmed, ButtonError, ButtonLight, ButtonPrimary } from '../../components/Button'
import { GreyCard } from '../../components/Card'
import Column, { AutoColumn } from '../../components/Column'
import CurrencyLogo from '../../components/CurrencyLogo'
import NFTSelectPanel from '../../components/CurrencySelectPanel'
import Loader from '../../components/Loader'
import { StickBall } from '../../components/merge/FastAccess'
import MergeHeader from '../../components/merge/MergeHeader'
import MergeWrapper from '../../components/merge/MergeWrapper'
import ToolTipModal from '../../components/merge/ToolTipModal'
import NFTListPanel from '../../components/NFTListPanel'
import Row, { AutoRow, RowFixed } from '../../components/Row'
import confirmPriceImpactWithoutFee from '../../components/swap/confirmPriceImpactWithoutFee'
import ConfirmSwapModal from '../../components/swap/ConfirmSwapModal'
import {
  Dots,
  PlusWrapper,
  ResponsiveTooltipContainer,
  SwapCallbackError,
  Wrapper,
} from '../../components/swap/styleds'
import { SwitchLocaleLink } from '../../components/SwitchLocaleLink'
import TokenWarningModal from '../../components/TokenWarningModal'
import { assets } from '../../constants/opensea'
import { useAllTokens, useCurrency } from '../../hooks/Tokens'
import { ApprovalState, useApproveCallbackFromTrade } from '../../hooks/useApproveCallback'
import useENSAddress from '../../hooks/useENSAddress'
import { useERC20PermitFromTrade, UseERC20PermitState } from '../../hooks/useERC20Permit'
import useIsArgentWallet from '../../hooks/useIsArgentWallet'
import { useIsSwapUnsupported } from '../../hooks/useIsSwapUnsupported'
import { useSwapCallback } from '../../hooks/useSwapCallback'
import useToggledVersion from '../../hooks/useToggledVersion'
import { useUSDCValue } from '../../hooks/useUSDCPrice'
import useWrapCallback, { WrapType } from '../../hooks/useWrapCallback'
import { useActiveWeb3React } from '../../hooks/web3'
import { useWalletModalToggle } from '../../state/application/hooks'
import { Field } from '../../state/merge/actions'
import {
  useCleanNFTSelect,
  useDefaultsFromURLSearch,
  useDerivedSwapInfo,
  useMergeSwapState,
  useSwapActionHandlers,
} from '../../state/merge/hooks'
import { useExpertModeManager } from '../../state/user/hooks'
import { LinkStyledButton, TYPE } from '../../theme'
import { computeFiatValuePriceImpact } from '../../utils/computeFiatValuePriceImpact'
import { getTradeVersion } from '../../utils/getTradeVersion'
import { maxAmountSpend } from '../../utils/maxAmountSpend'
import { warningSeverity } from '../../utils/prices'
import AppBody from '../MergeAppBody'

const StyledInfo = styled(Info)`
  height: 16px;
  width: 16px;
  margin-left: 4px;
  color: ${({ theme }) => theme.text3};
  :hover {
    color: ${({ theme }) => theme.text1};
  }
`

const StyledColumn = styled(Column)`
  height 100%;
`

const StyledRow = styled(Row)`
  padding: 0.5rem 0.5rem 0.5rem 0.5rem;
`

const StyledButtonPrimary = styled(ButtonPrimary)`
  padding: 0.75rem;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    padding: 10px;
  `};
`

export default function Merge({ history }: RouteComponentProps) {
  const { account, chainId } = useActiveWeb3React()
  const loadedUrlParams = useDefaultsFromURLSearch()

  // token warning stuff
  const [loadedInputCurrency, loadedOutputCurrency] = [
    useCurrency(loadedUrlParams?.inputCurrencyId),
    useCurrency(loadedUrlParams?.outputCurrencyId),
  ]
  const [dismissTokenWarning, setDismissTokenWarning] = useState<boolean>(false)
  const urlLoadedTokens: Token[] = useMemo(
    () => [loadedInputCurrency, loadedOutputCurrency]?.filter((c): c is Token => c?.isToken ?? false) ?? [],
    [loadedInputCurrency, loadedOutputCurrency]
  )
  const handleConfirmTokenWarning = useCallback(() => {
    setDismissTokenWarning(true)
  }, [])

  const strikBallRef = useRef<{ setVisiable: (isVisiable: boolean) => void }>(null)

  // dismiss warning if all imported tokens are in active lists
  const defaultTokens = useAllTokens()

  const fetchNFT = useFetchNFTListCallback()

  const cleanSelectNFT = useCleanNFTSelect()

  const importTokensNotInDefault =
    urlLoadedTokens &&
    urlLoadedTokens.filter((token: Token) => {
      return !Boolean(token.address in defaultTokens)
    })

  const theme = useContext(ThemeContext)

  // toggle wallet when disconnected
  const toggleWalletModal = useWalletModalToggle()

  // for expert mode
  const [isExpertMode] = useExpertModeManager()

  // get version from the url
  const toggledVersion = useToggledVersion()

  // swap state
  const {
    currentNFTs,
    independentField,
    typedValue,
    recipient,
    [Field.INPUT]: inputData,
    [Field.YIN_NFT]: yinNFT,
    [Field.YANG_NFT]: yangNFT,
  } = useMergeSwapState()

  const [tipContent, setTipContent] = useState<string>('')
  const [isTipOpen, setIsTipOpen] = useState(false)

  const tipOpenDismiss = useCallback(() => {
    setIsTipOpen(false)
  }, [setIsTipOpen])

  useEffect(() => {
    console.log('当前选中的NFT:', yinNFT, yangNFT)
  }, [yinNFT, yangNFT])

  const {
    v3Trade: { state: v3TradeState },
    bestTrade: trade,
    allowedSlippage,
    currencyBalances,
    parsedAmount,
    currencies,
    inputError: swapInputError,
  } = useDerivedSwapInfo(toggledVersion)

  const {
    wrapType,
    execute: onWrap,
    inputError: wrapInputError,
  } = useWrapCallback(currencies[Field.INPUT], currencies[Field.OUTPUT], typedValue)

  const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE
  const { address: recipientAddress } = useENSAddress(recipient)

  const parsedAmounts = useMemo(
    () =>
      // showWrap
      ({
        [Field.INPUT]: parsedAmount,
        [Field.OUTPUT]: parsedAmount,
      }),
    // : {
    //     [Field.INPUT]: independentField === Field.INPUT ? parsedAmount : trade?.inputAmount,
    //     [Field.OUTPUT]: independentField === Field.OUTPUT ? parsedAmount : trade?.outputAmount,
    //   },
    [independentField, parsedAmount, showWrap, trade]
  )

  const [routeNotFound, routeIsLoading, routeIsSyncing] = useMemo(
    () => [
      trade instanceof V3Trade ? !trade?.swaps : !trade?.route,
      V3TradeState.LOADING === v3TradeState,
      V3TradeState.SYNCING === v3TradeState,
    ],
    [trade, v3TradeState]
  )

  const [mergeStatus, doMerge] = useNFTMergeCallback(yinNFT, yangNFT)

  const fiatValueInput = useUSDCValue(parsedAmounts[Field.INPUT])
  const fiatValueOutput = useUSDCValue(parsedAmounts[Field.OUTPUT])
  const priceImpact = routeIsSyncing ? undefined : computeFiatValuePriceImpact(fiatValueInput, fiatValueOutput)

  const { onSwitchTokens, onNFTSelection, onCurrencySelection, onUserInput, onChangeRecipient } =
    useSwapActionHandlers()

  const isValid = !swapInputError
  const dependentField: Field = independentField === Field.YIN_NFT ? Field.YANG_NFT : Field.YIN_NFT

  const handleTypeInput = useCallback(
    (value: string) => {
      onUserInput(Field.INPUT, value)
    },
    [onUserInput]
  )

  const handleTypeOutput = useCallback(
    (value: string) => {
      onUserInput(Field.OUTPUT, value)
    },
    [onUserInput]
  )

  const handleMerge = useCallback(
    (evt: MouseEvent) => {
      // 开始执行合并
      doMerge()
        .then(() => {
          strikBallRef.current?.setVisiable(false)
          cleanSelectNFT()
          setTipContent(t`The merge request has been submitted, please wait patiently or refresh the page.`)
          console.log('合并请求已提交请耐心等待。')
          setIsTipOpen(true)
        })
        .catch((err) => {
          setTipContent(t`please approve first!`)
          setIsTipOpen(true)
        })
      console.log('打印当前合并状态：', mergeStatus)
    },
    [doMerge]
  )

  // reset if they close warning without tokens in params
  const handleDismissTokenWarning = useCallback(() => {
    setDismissTokenWarning(true)
    history.push('/merge/')
  }, [history])

  // modal and loading
  const [{ showConfirm, tradeToConfirm, swapErrorMessage, attemptingTxn, txHash }, setSwapState] = useState<{
    showConfirm: boolean
    tradeToConfirm: V2Trade<Currency, Currency, TradeType> | V3Trade<Currency, Currency, TradeType> | undefined
    attemptingTxn: boolean
    swapErrorMessage: string | undefined
    txHash: string | undefined
  }>({
    showConfirm: false,
    tradeToConfirm: undefined,
    attemptingTxn: false,
    swapErrorMessage: undefined,
    txHash: undefined,
  })

  const formattedAmounts = {
    [independentField]: typedValue,
    // [dependentField]: showWrap
    //   ? parsedAmounts[independentField]?.toExact() ?? ''
    //   : parsedAmounts[dependentField]?.toSignificant(6) ?? '',
  }

  const userHasSpecifiedInputOutput = false
  // const userHasSpecifiedInputOutput = Boolean(
  //   currencies[Field.INPUT] && currencies[Field.OUTPUT] && parsedAmounts[independentField]?.greaterThan(JSBI.BigInt(0))
  // )

  // check whether the user has approved the router on the input token
  const [approvalState, approveCallback] = useApproveCallbackFromTrade(trade, allowedSlippage)
  const {
    state: signatureState,
    signatureData,
    gatherPermitSignature,
  } = useERC20PermitFromTrade(trade, allowedSlippage)

  const handleApprove = useCallback(async () => {
    if (signatureState === UseERC20PermitState.NOT_SIGNED && gatherPermitSignature) {
      try {
        await gatherPermitSignature()
      } catch (error) {
        // try to approve if gatherPermitSignature failed for any reason other than the user rejecting it
        if (error?.code !== 4001) {
          await approveCallback()
        }
      }
    } else {
      await approveCallback()

      ReactGA.event({
        category: 'Swap',
        action: 'Approve',
        label: [trade?.inputAmount.currency.symbol, toggledVersion].join('/'),
      })
    }
  }, [approveCallback, gatherPermitSignature, signatureState, toggledVersion, trade?.inputAmount.currency.symbol])

  // check if user has gone through approval process, used to show two step buttons, reset on token change
  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false)

  // mark when a user has submitted an approval, reset onTokenSelection for input field
  useEffect(() => {
    if (approvalState === ApprovalState.PENDING) {
      setApprovalSubmitted(true)
    }
  }, [approvalState, approvalSubmitted])

  useEffect(() => {
    // fetchNFT(field, assets(account), true)
    if (account) {
      fetchNFT(Field.INPUT, assets(chainId, account), true)
    }
  }, [fetchNFT, account, chainId])

  const maxInputAmount: CurrencyAmount<Currency> | undefined = maxAmountSpend(currencyBalances[Field.INPUT])
  const showMaxButton = Boolean(maxInputAmount?.greaterThan(0) && !parsedAmounts[Field.INPUT]?.equalTo(maxInputAmount))

  // the callback to execute the swap
  const { callback: swapCallback, error: swapCallbackError } = useSwapCallback(
    trade,
    allowedSlippage,
    recipient,
    signatureData
  )

  const handleSwap = useCallback(() => {
    if (!swapCallback) {
      return
    }
    if (priceImpact && !confirmPriceImpactWithoutFee(priceImpact)) {
      return
    }
    setSwapState({ attemptingTxn: true, tradeToConfirm, showConfirm, swapErrorMessage: undefined, txHash: undefined })
    swapCallback()
      .then((hash) => {
        setSwapState({ attemptingTxn: false, tradeToConfirm, showConfirm, swapErrorMessage: undefined, txHash: hash })
        ReactGA.event({
          category: 'Swap',
          action:
            recipient === null
              ? 'Swap w/o Send'
              : (recipientAddress ?? recipient) === account
              ? 'Swap w/o Send + recipient'
              : 'Swap w/ Send',
          label: [
            trade?.inputAmount?.currency?.symbol,
            trade?.outputAmount?.currency?.symbol,
            getTradeVersion(trade),
            'MH',
          ].join('/'),
        })
      })
      .catch((error) => {
        setSwapState({
          attemptingTxn: false,
          tradeToConfirm,
          showConfirm,
          swapErrorMessage: error.message,
          txHash: undefined,
        })
      })
  }, [swapCallback, priceImpact, tradeToConfirm, showConfirm, recipient, recipientAddress, account, trade])

  // errors
  const [showInverted, setShowInverted] = useState<boolean>(false)

  // warnings on the greater of fiat value price impact and execution price impact
  const priceImpactSeverity = useMemo(() => {
    const executionPriceImpact = trade?.priceImpact
    return warningSeverity(
      executionPriceImpact && priceImpact
        ? executionPriceImpact.greaterThan(priceImpact)
          ? executionPriceImpact
          : priceImpact
        : executionPriceImpact ?? priceImpact
    )
  }, [priceImpact, trade])

  const isArgentWallet = useIsArgentWallet()

  // show approve flow when: no error on inputs, not approved or pending, or approved in current session
  // never show if price impact is above threshold in non expert mode
  const showApproveFlow =
    !isArgentWallet &&
    !swapInputError &&
    (approvalState === ApprovalState.NOT_APPROVED ||
      approvalState === ApprovalState.PENDING ||
      (approvalSubmitted && approvalState === ApprovalState.APPROVED)) &&
    !(priceImpactSeverity > 3 && !isExpertMode)

  const handleConfirmDismiss = useCallback(() => {
    setSwapState({ showConfirm: false, tradeToConfirm, attemptingTxn, swapErrorMessage, txHash })
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onUserInput(Field.INPUT, '')
    }
  }, [attemptingTxn, onUserInput, swapErrorMessage, tradeToConfirm, txHash])

  const handleAcceptChanges = useCallback(() => {
    setSwapState({ tradeToConfirm: trade, swapErrorMessage, txHash, attemptingTxn, showConfirm })
  }, [attemptingTxn, showConfirm, swapErrorMessage, trade, txHash])

  const handleInputSelect = useCallback(
    (inputCurrency) => {
      // console.log('handleInputSelect::', inputCurrency)
      setApprovalSubmitted(false) // reset 2 step UI for approvals
      onCurrencySelection(Field.INPUT, inputCurrency)
    },
    [onCurrencySelection]
  )

  const handleNFTSelect = useCallback(
    (token) => {
      console.log('执行handleNFTSelect::', independentField, token)
      onNFTSelection && onNFTSelection(independentField, token)
    },
    [independentField, onNFTSelection]
  )

  const handleMaxInput = useCallback(() => {
    maxInputAmount && onUserInput(Field.INPUT, maxInputAmount.toExact())
    ReactGA.event({
      category: 'Swap',
      action: 'Max',
    })
  }, [maxInputAmount, onUserInput])

  const handleOutputSelect = useCallback(
    (outputCurrency) => onCurrencySelection(Field.OUTPUT, outputCurrency),
    [onCurrencySelection]
  )

  const swapIsUnsupported = useIsSwapUnsupported(currencies[Field.INPUT], currencies[Field.OUTPUT])

  const priceImpactTooHigh = priceImpactSeverity > 3 && !isExpertMode

  return (
    <>
      <TokenWarningModal
        isOpen={importTokensNotInDefault.length > 0 && !dismissTokenWarning}
        tokens={importTokensNotInDefault}
        onConfirm={handleConfirmTokenWarning}
        onDismiss={handleDismissTokenWarning}
      />
      <NetworkAlert />
      <ToolTipModal isOpen={isTipOpen} onDismiss={tipOpenDismiss} content={tipContent}></ToolTipModal>
      <AppBody>
        <MergeHeader allowedSlippage={allowedSlippage} />
        <Wrapper id="merge-page">
          <ConfirmSwapModal
            isOpen={showConfirm}
            trade={trade}
            originalTrade={tradeToConfirm}
            onAcceptChanges={handleAcceptChanges}
            attemptingTxn={attemptingTxn}
            txHash={txHash}
            recipient={recipient}
            allowedSlippage={allowedSlippage}
            onConfirm={handleSwap}
            swapErrorMessage={swapErrorMessage}
            onDismiss={handleConfirmDismiss}
          />
          <AutoColumn gap={'sm'}>
            <div style={{ display: 'relative' }}>
              <NFTListPanel
                // label={
                //   independentField === Field.OUTPUT && !showWrap ? <Trans>From (at most)</Trans> : <Trans>From</Trans>
                // }
                value={formattedAmounts[Field.INPUT]}
                showMaxButton={showMaxButton}
                tokenList={currentNFTs?.nftList}
                currency={currencies[Field.INPUT]}
                otherCurrency={currencies[Field.OUTPUT]}
                yin={yinNFT}
                yang={yangNFT}
                onUserInput={handleTypeInput}
                onMax={handleMaxInput}
                hideInput={true}
                fiatValue={fiatValueInput ?? undefined}
                onNFTSelect={handleNFTSelect}
                showCommonBases={true}
                id="nft-list-pannel"
                // loading={independentField === Field.OUTPUT && routeIsSyncing}
              ></NFTListPanel>
            </div>

            {recipient !== null && !showWrap ? (
              <>
                <AutoRow justify="space-between" style={{ padding: '0 1rem' }}>
                  <PlusWrapper clickable={false}>
                    <Plus size="16" color={theme.text2} />
                  </PlusWrapper>
                  <LinkStyledButton id="remove-recipient-button" onClick={() => onChangeRecipient(null)}>
                    <Trans>- Remove recipient</Trans>
                  </LinkStyledButton>
                </AutoRow>
                <AddressInputPanel id="recipient" value={recipient} onChange={onChangeRecipient} />
              </>
            ) : null}

            {!showWrap && trade && (
              <Row justify={!trade ? 'center' : 'space-between'}>
                <RowFixed style={{ position: 'relative' }}>
                  <MouseoverTooltipContent
                    wrap={false}
                    content={
                      <ResponsiveTooltipContainer>
                        <SwapRoute trade={trade} syncing={routeIsSyncing} />
                      </ResponsiveTooltipContainer>
                    }
                    placement="bottom"
                    onOpen={() =>
                      ReactGA.event({
                        category: 'Swap',
                        action: 'Router Tooltip Open',
                      })
                    }
                  >
                    <AutoRow gap="4px" width="auto">
                      <AutoRouterLogo />
                      <LoadingOpacityContainer $loading={routeIsSyncing}>
                        {trade instanceof V3Trade && trade.swaps.length > 1 && (
                          <TYPE.blue fontSize={14}>{trade.swaps.length} routes</TYPE.blue>
                        )}
                      </LoadingOpacityContainer>
                    </AutoRow>
                  </MouseoverTooltipContent>
                </RowFixed>
                <RowFixed>
                  <LoadingOpacityContainer $loading={routeIsSyncing}>
                    <TradePrice
                      price={trade.executionPrice}
                      showInverted={showInverted}
                      setShowInverted={setShowInverted}
                    />
                  </LoadingOpacityContainer>
                  <MouseoverTooltipContent
                    wrap={false}
                    content={
                      <ResponsiveTooltipContainer origin="top right" width={'295px'}>
                        <AdvancedSwapDetails trade={trade} allowedSlippage={allowedSlippage} syncing={routeIsSyncing} />
                      </ResponsiveTooltipContainer>
                    }
                    placement="bottom"
                    onOpen={() =>
                      ReactGA.event({
                        category: 'Swap',
                        action: 'Transaction Details Tooltip Open',
                      })
                    }
                  >
                    <StyledInfo />
                  </MouseoverTooltipContent>
                </RowFixed>
              </Row>
            )}
          </AutoColumn>
        </Wrapper>
        <StickBall ref={strikBallRef}>
          <StyledColumn>
            <MergeWrapper>
              <NFTSelectPanel
                // label={
                //   independentField === Field.OUTPUT && !showWrap ? <Trans>From (at most)</Trans> : <Trans>From</Trans>
                // }
                value={formattedAmounts[Field.INPUT]}
                showMaxButton={showMaxButton}
                tokenList={inputData.nftList}
                currency={currencies[Field.INPUT]}
                nft={yinNFT}
                onUserInput={handleTypeInput}
                onMax={handleMaxInput}
                hideInput={true}
                fiatValue={fiatValueInput ?? undefined}
                onCurrencySelect={handleInputSelect}
                otherCurrency={currencies[Field.OUTPUT]}
                otherNft={yangNFT}
                showCommonBases={true}
                id="merge-nft-yin"
                // loading={independentField === Field.OUTPUT && routeIsSyncing}
              />
              <PlusWrapper clickable>
                <Plus
                  size="16"
                  onClick={() => {
                    setApprovalSubmitted(false) // reset 2 step UI for approvals
                    onSwitchTokens()
                  }}
                  color={currencies[Field.INPUT] && currencies[Field.OUTPUT] ? theme.text1 : theme.text3}
                />
              </PlusWrapper>
              <NFTSelectPanel
                value={formattedAmounts[Field.OUTPUT]}
                onUserInput={handleTypeOutput}
                // label={independentField === Field.INPUT && !showWrap ? <Trans>To (at least)</Trans> : <Trans>To</Trans>}
                showMaxButton={false}
                hideBalance={false}
                hideInput={true}
                fiatValue={fiatValueOutput ?? undefined}
                priceImpact={priceImpact}
                currency={currencies[Field.OUTPUT]}
                nft={yangNFT}
                onCurrencySelect={handleOutputSelect}
                otherCurrency={currencies[Field.INPUT]}
                otherNft={yinNFT}
                showCommonBases={true}
                id="merge-nft-yang"
                // loading={independentField === Field.INPUT && routeIsSyncing}
              />
            </MergeWrapper>
            <StyledRow>
              <StyledButtonPrimary
                onClick={(evt) => {
                  // alert('start merge')
                  handleMerge(evt)
                }}
              >
                Merge
              </StyledButtonPrimary>
            </StyledRow>
          </StyledColumn>
        </StickBall>
      </AppBody>
      <SwitchLocaleLink />
      {!swapIsUnsupported ? null : (
        <UnsupportedCurrencyFooter
          show={swapIsUnsupported}
          currencies={[currencies[Field.INPUT], currencies[Field.OUTPUT]]}
        />
      )}
    </>
  )
}
