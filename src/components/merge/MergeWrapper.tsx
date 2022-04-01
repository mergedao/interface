import React from 'react'
import styled from 'styled-components/macro'
import { MEDIA_WIDTHS } from 'theme'

import { AutoRow, RowFixed } from '../Row'

const StyledSwapHeader = styled.div`
  padding: 1rem 1.25rem 0.5rem 1.25rem;
  width: 100%;
  flex: 1;
`

// 小屏幕分辨率
const StyledAutoRow = styled(AutoRow)`
  @media screen and (min-width: ${MEDIA_WIDTHS.upToExtraSmall}px) {
    flex-direction: row;
    display: flex;
    height: 100%;
  }
`

const StyledRowFixedCenter = styled(RowFixed)`
  width: 100%;
  justify-content: center;
  > div {
    left: 0;
  }
  @media screen and (min-width: ${MEDIA_WIDTHS.upToExtraSmall}px) {
    width: 2px;
    justify-content: center;
    align-items: center;
    z-index: 9;
    > div {
      left: 0;
    }
  }
`

const StyledRowFixed = styled(RowFixed)`
  @media screen and (min-width: ${MEDIA_WIDTHS.upToExtraSmall}px) {
    flex: 1;
    height: 100%;
  }
`

// merge-header 应该包括筛选项，如何做好筛选是个挑战
export default function MergeWrapper({ children }: { children: React.ReactNode }) {
  const childs = React.Children.toArray(children)
  return (
    <StyledSwapHeader>
      <StyledAutoRow>
        <StyledRowFixed>{childs[0]}</StyledRowFixed>
        <StyledRowFixedCenter>{childs[1]}</StyledRowFixedCenter>
        <StyledRowFixed>{childs[2]}</StyledRowFixed>
      </StyledAutoRow>
    </StyledSwapHeader>
  )
}
