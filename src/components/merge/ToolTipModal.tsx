import { Trans } from '@lingui/macro'
import styled from 'styled-components/macro'

import { ReactComponent as Close } from '../../assets/images/x.svg'
import Card from '../Card'
import Modal from '../Modal'

const CloseIcon = styled.div`
  position: absolute;
  right: 1rem;
  top: 14px;
  &:hover {
    cursor: pointer;
    opacity: 0.6;
  }
`

const CloseColor = styled(Close)`
  path {
    stroke: ${({ theme }) => theme.text4};
  }
`

const Wrapper = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap}
  margin: 0;
  padding: 0;
  width: 100%;
`

const HeaderRow = styled.div`
  ${({ theme }) => theme.flexRowNoWrap};
  padding: 1rem 1rem;
  font-weight: 500;
  color: ${(props) => (props.color === 'blue' ? ({ theme }) => theme.primary1 : 'inherit')};
  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 1rem;
  `};
`

const ContentWrapper = styled.div`
  background-color: ${({ theme }) => theme.bg0};
  padding: 1rem 1rem 1rem 1rem;
  text-align: center;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;

  ${({ theme }) => theme.mediaWidth.upToMedium`padding: 0 1rem 1rem 1rem`};
`

const UpperSection = styled.div`
  position: relative;

  h5 {
    margin: 0;
    margin-bottom: 0.5rem;
    font-size: 1rem;
    font-weight: 400;
  }

  h5:last-child {
    margin-bottom: 0px;
  }

  h4 {
    margin-top: 0;
    font-weight: 500;
  }
`

const OptionGrid = styled.div`
  display: grid;
  grid-gap: 10px;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    grid-template-columns: 1fr;
    grid-gap: 10px;
  `};
`

const HoverText = styled.div`
  text-decoration: none;
  color: ${({ theme }) => theme.text1};
  display: flex;
  align-items: center;

  :hover {
    cursor: pointer;
  }
`

const LinkCard = styled(Card)`
  background-color: ${({ theme }) => theme.primary1};
  color: ${({ theme }) => theme.white};

  :hover {
    cursor: pointer;
    filter: brightness(0.9);
  }
`

const WALLET_VIEWS = {
  OPTIONS: 'options',
  OPTIONS_SECONDARY: 'options_secondary',
  ACCOUNT: 'account',
  PENDING: 'pending',
  LEGAL: 'legal',
}

export default function ToolTipModal({
  onDismiss,
  isOpen,
  content,
}: {
  onDismiss: () => void
  isOpen: boolean
  content: string
}): JSX.Element {
  // important that these are destructed from the account-specific web3-react context
  // const [toolTipOpen, setToolTipOpen] = useMemo(isOpen)

  // const toggleToolTipModal = useCallback(() => {
  //   setToolTipOpen(!toolTipOpen)
  // }, [setToolTipOpen, toolTipOpen])

  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss} minHeight={false} maxHeight={90}>
      <Wrapper>
        <ContentWrapper>
          <h5>{content}</h5>
        </ContentWrapper>
      </Wrapper>
    </Modal>
  )
}
