import { animated, useSpring } from '@react-spring/web'
import { useWindowSize } from 'hooks/useWindowSize'
import React, { useCallback, useEffect, useImperativeHandle, useState } from 'react'
import { Pocket, X } from 'react-feather'
import styled from 'styled-components/macro'

import useTheme from '../../hooks/useTheme'
// import { QuestionOutlined, CloseOutlined } from '@ant-design/icons';
// import style from './index.module.scss';

const Wrapper = styled.div<{ bottom?: number }>`
  z-index: 9;
  background-color: ${({ theme }) => theme.bg2};
  position: fixed;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  right: 40px;
  bottom: ${({ bottom }) => {
    return bottom
  }}px;
  border: ${({ theme }) => {
    return '1px solid ' + theme.text4
  }};
  padding: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.2s ease-in-out;
  box-shadow: ${({ theme }) => {
    return '0 0px 6px 3px ' + theme.text4 + ''
  }};
  :hover {
    box-shadow: ${({ theme }) => {
      return '0 0px 10px 3px ' + theme.text4 + ''
    }};
    border: ${({ theme }) => {
      return '1px solid ' + theme.text4
    }};
  }
  :active {
    box-shadow: ${({ theme }) => {
      return '0 0px 10px 3px ' + theme.text4 + ''
    }};
  }
  > div:last-child {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    user-select: none;
    cursor: pointer;
    > div {
      position: absolute;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      > span {
        font-size: 24px;
        color: #3e84f7;
        &:hover {
          color: #478af5;
        }
        &:active {
          color: #3e69ae;
        }
      }
    }
  }
`

const PBWrapper = styled.div<{ size?: { width?: number; height?: number } }>`
  position: absolute;
  // width: 120px;
  // height: 100px;
  height: 0;
  top: 0;
  right: 0;
  // transform: translate(0, -250px);
  transform: translate(0, ${({ size }) => -(size?.height ?? 0) - 10}px);
  // border: 1px solid red;
  &.hide {
    display: none;
  }
`

const Popover = styled.div<{ size?: { width?: number; height?: number } }>`
  min-width: 236px;
  max-width: 400px;
  width: ${({ size }) => size?.width}px;
  height: ${({ size }) => size?.height}px;
  background: ${({ theme }) => theme.bg1};
  color: ${({ theme }) => theme.text2};
  box-sizing: content-box;
  // padding: 10px;
  border: 1px solid ${({ theme }) => theme.text4};
  border-radius: 10px;
  overflow: auto;
  box-shadow: ${({ theme }) => {
    return '0 0px 10px 3px ' + theme.text4 + ''
  }};
  &.hide {
    display: none;
  }
`

export interface IPopoverProps {
  className?: string
  isVisible?: boolean
  size?: {
    width?: number
    height?: number
  }
  children: React.ReactNode
}

export function PopoverBox(props: IPopoverProps) {
  const { className, isVisible, children, size } = props
  // const [isVisible, setVisiable] = useState(false);
  const styles = useSpring({
    opacity: isVisible ? 1 : 0,
    scale: isVisible ? 1 : 0,
    x: isVisible ? 0 : (size?.width ?? 0) / 2,
    y: isVisible ? 0 : (size?.height ?? 0) / 2,
  })

  return (
    <PBWrapper className={className} size={size}>
      <animated.div
        style={{
          ...styles,
        }}
      >
        {children}
      </animated.div>
    </PBWrapper>
  )
}

export interface IStickBallProps {
  className?: string
  top?: number
  bottom?: number
  left?: number
  right?: number
  show?: boolean
  size?: {
    width?: number
    height?: number
  }
  onChange?: (show: boolean) => void
  children?: React.ReactNode
}

export const StickBall = React.forwardRef(
  (
    props: IStickBallProps = {
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    ref
  ) => {
    const {
      className = '',
      top = 0,
      bottom = 180,
      left = 0,
      right = 0,
      show = false,
      size = {
        width: 400,
        height: 400,
      },
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      onChange = () => {},
      children,
    } = props

    const [isVisible, setVisiable] = useState(show)
    const theme = useTheme()
    const winSize = useWindowSize()

    const questionStyle = useSpring({
      opacity: !isVisible ? 1 : 0,
      scale: !isVisible ? 1 : 0,
    })

    const closeStyles = useSpring({
      opacity: isVisible ? 1 : 0,
      scale: isVisible ? 1 : 0,
    })

    const popverSize = {
      width: winSize.width && winSize.width > 500 ? size.width : (size.width ?? 0) - 164,
      height: size.height,
    }

    const strickBottom = winSize.width && winSize.width > 500 ? bottom : bottom - 40
    // const previousValueRef = useRef();
    // const previousValue = previousValueRef.current;

    // console.log(isVisible, show)

    // if (show !== previousValue && show !== isVisible) {
    //   setVisiable(value);
    //   onChange(value);
    // }

    // useEffect(() => {
    //   previousValueRef.current = isVisible;
    // });

    useEffect(() => {
      setVisiable(show)
    }, [show])

    const handleClick = useCallback(() => {
      setVisiable(!isVisible)
      onChange(!isVisible)
    }, [setVisiable, onChange, isVisible])

    useImperativeHandle(ref, () => ({
      setVisiable: (isVisible: boolean) => {
        setVisiable(isVisible)
      },
    }))

    return (
      <Wrapper bottom={strickBottom}>
        <PopoverBox isVisible={isVisible} size={popverSize}>
          <Popover size={popverSize}>{children}</Popover>
        </PopoverBox>
        <div onClick={handleClick}>
          <animated.div style={{ ...questionStyle }}>
            <Pocket color={theme.text2} size={20} />
            {/* <QuestionOutlined /> */}
          </animated.div>
          <animated.div style={{ ...closeStyles }}>
            <X color={theme.text2} />
            {/* <CloseOutlined /> */}
          </animated.div>
        </div>
      </Wrapper>
    )
  }
)
