import { Trans } from '@lingui/macro'
import { Percent } from '@uniswap/sdk-core'
import styled from 'styled-components/macro'

import { TYPE } from '../../theme'
import RefreshTab from '../Refresh'
import { RowBetween, RowFixed } from '../Row'

const StyledSwapHeader = styled.div`
  padding: 1rem 1.25rem 0.5rem 1.25rem;
  width: 100%;
  color: ${({ theme }) => theme.text2};
`

// merge-header 应该包括筛选项，如何做好筛选是个挑战
export default function MergeHeader({ allowedSlippage }: { allowedSlippage: Percent }) {
  return (
    <StyledSwapHeader>
      <RowBetween>
        <RowFixed>
          <TYPE.black fontWeight={500} fontSize={16} style={{ marginRight: '8px' }}>
            <Trans>NFT</Trans>
          </TYPE.black>
        </RowFixed>
        <RowFixed>
          <RefreshTab placeholderSlippage={allowedSlippage} />
        </RowFixed>
      </RowBetween>
    </StyledSwapHeader>
  )
}
