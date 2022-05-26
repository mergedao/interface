import React from 'react'
import styled from 'styled-components/macro'
import { Z_INDEX } from 'theme'

export const BodyWrapper = styled.main<{ margin?: string; maxWidth?: string }>`
  position: relative;
  margin-top: ${({ margin }) => margin ?? '0px'};
  max-width: 1104px;
  ${({ theme }) => theme.mediaWidth.upToLarge`
    // padding: 1rem;
    max-width: 832px;
  `};
  ${({ theme }) => theme.mediaWidth.upToMedium`
    // padding: 1rem;
    max-width: 560px;
  `};
  ${({ theme }) => theme.mediaWidth.upToSmall`
    // padding: 1rem;
    max-width: auto;
  `};
  // max-width: ${({ maxWidth }) => maxWidth ?? '480px'}; // 不设置最大宽
  width: 100%;
  background: ${({ theme }) => theme.bg0};
  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);
  border-radius: 24px;
  margin-top: 1rem;
  margin-left: auto;
  margin-right: auto;
  z-index: ${Z_INDEX.deprecated_content};
`

/**
 * The styled container element that wraps the content of most pages and the tabs.
 */
export default function AppBody({ children, ...rest }: { children: React.ReactNode }) {
  return (
    <BodyWrapper maxWidth="1104px" {...rest}>
      {children}
    </BodyWrapper>
  )
}
