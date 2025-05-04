import type { ReactNode } from 'react'
import { makeStyles, tokens } from '@fluentui/react-components'
import { useEffect, useRef, useState } from 'react'

interface ResizablePanelProps {
  left: ReactNode
  right: ReactNode
  isVertical?: boolean // 是否垂直布局
  initialLeftWidth?: number // 初始左侧宽度百分比
  minLeftWidth?: number // 最小左侧宽度百分比
  maxLeftWidth?: number // 最大左侧宽度百分比
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
    borderRadius: '999px',
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
  isVertical = false,
  initialLeftWidth = 50,
  minLeftWidth = 10,
  maxLeftWidth = 90,
}: ResizablePanelProps) {
  const styles = useStyles()
  const [leftWidth, setLeftWidth] = useState(initialLeftWidth)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const initialPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const initialLeftWidthRef = useRef<number>(initialLeftWidth)

  // 处理拖动开始 - 鼠标事件
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    initialPos.current = { x: e.clientX, y: e.clientY }
    initialLeftWidthRef.current = leftWidth
    setIsDragging(true)
  }

  // 处理触摸开始 - 触摸事件
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      e.preventDefault()
      const touch = e.touches[0]
      initialPos.current = { x: touch.clientX, y: touch.clientY }
      initialLeftWidthRef.current = leftWidth
      setIsDragging(true)
    }
  }

  // 通用的移动处理逻辑
  const handleMove = (clientX: number, clientY: number) => {
    if (isVertical) {
      const containerHeight = containerRef.current!.offsetHeight
      const deltaY = clientY - initialPos.current.y
      const deltaPercent = (deltaY / containerHeight) * 100

      let newLeftWidth = initialLeftWidthRef.current + deltaPercent
      newLeftWidth = Math.max(minLeftWidth, Math.min(maxLeftWidth, newLeftWidth))

      setLeftWidth(newLeftWidth)
    } else {
      const containerWidth = containerRef.current!.offsetWidth
      const deltaX = clientX - initialPos.current.x
      const deltaPercent = (deltaX / containerWidth) * 100

      let newLeftWidth = initialLeftWidthRef.current + deltaPercent
      newLeftWidth = Math.max(minLeftWidth, Math.min(maxLeftWidth, newLeftWidth))

      setLeftWidth(newLeftWidth)
    }
  }

  // 处理鼠标拖动过程
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !containerRef.current) {
      return
    }
    handleMove(e.clientX, e.clientY)
  }

  // 处理触摸拖动过程
  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging || !containerRef.current || e.touches.length !== 1) {
      return
    }
    const touch = e.touches[0]
    handleMove(touch.clientX, touch.clientY)
    e.preventDefault() // 防止页面滚动
  }

  // 处理拖动结束
  const handleDragEnd = () => {
    setIsDragging(false)
  }

  // 添加和移除事件监听器
  useEffect(() => {
    if (isDragging) {
      // 鼠标事件
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleDragEnd)

      // 触摸事件
      document.addEventListener('touchmove', handleTouchMove, { passive: false })
      document.addEventListener('touchend', handleDragEnd)
      document.addEventListener('touchcancel', handleDragEnd)

      return () => {
        // 鼠标事件
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleDragEnd)

        // 触摸事件
        document.removeEventListener('touchmove', handleTouchMove)
        document.removeEventListener('touchend', handleDragEnd)
        document.removeEventListener('touchcancel', handleDragEnd)
      }
    } else {
      // 鼠标事件
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleDragEnd)

      // 触摸事件
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleDragEnd)
      document.removeEventListener('touchcancel', handleDragEnd)
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
        onTouchStart={handleTouchStart}
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
