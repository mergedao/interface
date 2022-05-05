import { BigNumber } from '@ethersproject/bignumber'
import { TransactionResponse } from '@ethersproject/providers'
import { useCallback, useMemo } from 'react'
import { NFToken } from 'state/merge/reducer'

import useApproveCheck from './useApproveCheck'
import { useERC721Contract } from './useContract'
import useMergeAddress from './useMergeAddress'
import { useActiveWeb3React } from './web3'

export enum ApprovalState {
  UNKNOWN = 'UNKNOWN',
  NOT_APPROVED = 'NOT_APPROVED',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
}

// returns a variable indicating the state of the approval and a function which approves if necessary or early returns
export function useNFTApproveCallback(
  // amountToApprove?: CurrencyAmount<Currency>,
  // spender?: string,
  nftToken?: NFToken
): [ApprovalState, () => Promise<void>] {
  const { account, chainId } = useActiveWeb3React()
  // 获取token地址
  const token = nftToken?.contract ?? undefined
  //
  // const currentAllowance = useTokenAllowance(token, account ?? undefined, spender)
  // const approve = useApproveCheck(token)
  // const pendingApproval = useHasPendingApproval(token?.address, spender)

  // 重新检测当前token授权状态
  const approvalResult = useApproveCheck(nftToken?.tokenId, nftToken?.contract)

  // check the current approval status
  const approvalState: ApprovalState = useMemo(() => {
    // if (!amountToApprove || !spender) return ApprovalState.UNKNOWN
    if (approvalResult.loading === true) {
      if (approvalResult.result === true) {
        return ApprovalState.APPROVED
      } else {
        return ApprovalState.NOT_APPROVED
      }
    }
    return ApprovalState.UNKNOWN
    // we might not have enough data to know whether or not we need to approve
    // if (!currentAllowance) return ApprovalState.UNKNOWN
    // return ApprovalState.UNKNOWN
    // amountToApprove will be defined if currentAllowance is
    // return currentAllowance.lessThan(amountToApprove)
    //   ? pendingApproval
    //     ? ApprovalState.PENDING
    //     : ApprovalState.NOT_APPROVED
    //   : ApprovalState.APPROVED
  }, [approvalResult.result, approvalResult.loading])

  const tokenContract = useERC721Contract(nftToken?.contract)

  const mergeContractAddress = useMergeAddress()
  // const tokenContract = useTokenContract(token?.address)
  // const addTransaction = useTransactionAdder()

  const approve = useCallback(async (): Promise<void> => {
    // if (approvalState !== ApprovalState.NOT_APPROVED) {
    //   console.error('approve was called unnecessarily')
    //   return
    // }
    if (!chainId) {
      console.error('no chainId')
      return
    }

    if (!token) {
      console.error('no token')
      return
    }

    if (!tokenContract) {
      console.error('tokenContract is null')
      return
    }

    if (!nftToken?.tokenId) {
      console.error('tokenid is null')
      return
    }

    // if (!amountToApprove) {
    //   console.error('missing amount to approve')
    //   return
    // }

    // if (!spender) {
    //   console.error('no spender')
    //   return
    // }

    // 模拟gas费
    // let useExact = false
    // const estimatedGas = await tokenContract.estimateGas.approve(mergeContractAddress, nftToken?.tokenId).catch(() => {
    //   // general fallback for tokens who restrict approval amounts
    //   useExact = true
    //   return tokenContract.estimateGas.approve(mergeContractAddress, nftToken?.tokenId)
    // })

    // return tokenContract
    //   .approve(spender, useExact ? amountToApprove.quotient.toString() : MaxUint256, {
    //     gasLimit: calculateGasMargin(estimatedGas),
    //   })
    //   .then((response: TransactionResponse) => {
    //     addTransaction(response, { type: TransactionType.APPROVAL, tokenAddress: token.address, spender })
    //   })
    //   .catch((error: Error) => {
    //     console.debug('Failed to approve token', error)
    //     throw error
    //   })
    return tokenContract
      .approve(mergeContractAddress, BigNumber.from(nftToken?.tokenId))
      .then((response: TransactionResponse) => {
        console.log('发起一个交易：', response)
        // addTransaction(response, { type: TransactionType.APPROVAL, tokenAddress: token.address, spender })
      })
      .catch((error: Error) => {
        console.debug('Failed to approve token', error)
        throw error
      })
  }, [mergeContractAddress, token, nftToken?.tokenId, tokenContract, chainId])

  return [approvalState, approve]
}

// wraps useApproveCallback in the context of a swap
// export function useApproveCallbackFromTrade(
//   trade: V2Trade<Currency, Currency, TradeType> | V3Trade<Currency, Currency, TradeType> | undefined,
//   allowedSlippage: Percent
// ) {
//   const { chainId } = useActiveWeb3React()
//   const v3SwapRouterAddress = chainId ? SWAP_ROUTER_ADDRESSES[chainId] : undefined
//   const amountToApprove = useMemo(
//     () => (trade && trade.inputAmount.currency.isToken ? trade.maximumAmountIn(allowedSlippage) : undefined),
//     [trade, allowedSlippage]
//   )
//   return useApproveCallback(
//     amountToApprove,
//     chainId
//       ? trade instanceof V2Trade
//         ? V2_ROUTER_ADDRESS[chainId]
//         : trade instanceof V3Trade
//         ? v3SwapRouterAddress
//         : undefined
//       : undefined
//   )
// }
