import type { ReactNode } from 'react'
import { makeStyles, tokens } from '@fluentui/react-components'
import { useEffect, useRef, useState } from 'react'

interface ResizablePanelProps {
  left: ReactNode
  right: ReactNode
  initialLeftWidth?: number // 初始左侧宽度百分比
  minLeftWidth?: number // 最小左侧宽度百分比
  maxLeftWidth?: number // 最大左侧宽度百分比
  breakpoint?: number // 屏幕宽度断点，小于该值时转为垂直布局
}

const useStyles = makeStyles({
  container: {
    display: 'flex',
    width: '100%',
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  containerVertical: {
    flexDirection: 'column',
  },
  panel: {
    height: '100%',
    overflow: 'hidden',
    borderRadius: '8px',
  },
  panelVertical: {
    width: '100% !important',
    height: 'auto',
  },
  divider: {
    width: '8px',
    height: '100%',
    cursor: 'col-resize',
    transition: 'background-color 0.2s',
    '&:hover, &:active': {
      backgroundColor: tokens.colorBrandBackground,
    },
    position: 'relative',
    zIndex: 2,
  },
  dividerVertical: {
    width: '100% !important',
    height: '8px',
    cursor: 'row-resize',
  },
  // 拖动时的覆盖层，以防止拖动时出现内容选择或其他问题
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
    cursor: 'col-resize',
  },
  overlayVertical: {
    cursor: 'row-resize',
  },
})

export function ResizablePanel({
  left,
  right,
  initialLeftWidth = 50,
  minLeftWidth = 10,
  maxLeftWidth = 90,
  breakpoint = 1024, // 默认断点为768px
}: ResizablePanelProps) {
  const styles = useStyles()
  const [leftWidth, setLeftWidth] = useState(initialLeftWidth)
  const [isDragging, setIsDragging] = useState(false)
  const [isVertical, setIsVertical] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const initialPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const initialLeftWidthRef = useRef<number>(initialLeftWidth)

  // 检测屏幕宽度并更新布局方向
  useEffect(() => {
    const checkScreenSize = () => {
      setIsVertical(window.innerWidth < breakpoint)
    }

    // 初始检查
    checkScreenSize()

    // 监听窗口大小变化
    window.addEventListener('resize', checkScreenSize)

    return () => {
      window.removeEventListener('resize', checkScreenSize)
    }
  }, [breakpoint])

  // 处理拖动开始
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    initialPos.current = { x: e.clientX, y: e.clientY }
    initialLeftWidthRef.current = leftWidth
    setIsDragging(true)
  }

  // 处理拖动过程
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !containerRef.current) {
      return
    }

    if (isVertical) {
      const containerHeight = containerRef.current.offsetHeight
      const deltaY = e.clientY - initialPos.current.y
      const deltaPercent = (deltaY / containerHeight) * 100

      let newLeftWidth = initialLeftWidthRef.current + deltaPercent
      newLeftWidth = Math.max(minLeftWidth, Math.min(maxLeftWidth, newLeftWidth))

      setLeftWidth(newLeftWidth)
    } else {
      const containerWidth = containerRef.current.offsetWidth
      const deltaX = e.clientX - initialPos.current.x
      const deltaPercent = (deltaX / containerWidth) * 100

      let newLeftWidth = initialLeftWidthRef.current + deltaPercent
      newLeftWidth = Math.max(minLeftWidth, Math.min(maxLeftWidth, newLeftWidth))

      setLeftWidth(newLeftWidth)
    }
  }

  // 处理拖动结束
  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // 添加和移除事件监听器
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    } else {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, isVertical])

  return (
    <div
      className={`${styles.container} ${isVertical ? styles.containerVertical : ''}`}
      ref={containerRef}
    >
      <div
        className={`${styles.panel} ${isVertical ? styles.panelVertical : ''}`}
        style={isVertical ? { height: `${leftWidth}%` } : { width: `${leftWidth}%` }}
      >
        {left}
      </div>
      <div
        className={`${styles.divider} ${isVertical ? styles.dividerVertical : ''}`}
        onMouseDown={handleMouseDown}
      />
      <div
        className={`${styles.panel} ${isVertical ? styles.panelVertical : ''}`}
        style={
          isVertical
            ? { height: `${100 - leftWidth}%` }
            : { width: `${100 - leftWidth}%` }
        }
      >
        {right}
      </div>
      {isDragging && (
        <div
          className={`${styles.overlay} ${isVertical ? styles.overlayVertical : ''}`}
        />
      )}
    </div>
  )
}
