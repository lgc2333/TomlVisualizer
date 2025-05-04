import {
  createPresenceComponent,
  makeStyles,
  Text,
  tokens,
  Tooltip,
} from '@fluentui/react-components'
import {
  Calendar20Regular,
  CheckboxChecked20Regular,
  ChevronDown20Regular,
  ChevronRight20Regular,
  createFluentIcon,
  DismissCircle20Regular,
  Document20Regular,
  DocumentText20Regular,
  FolderList20Regular,
  NumberSymbol20Regular,
  TextBulletListLtr20Regular,
  TextWholeWord20Regular,
} from '@fluentui/react-icons'
import { createCollapsePresence } from '@fluentui/react-motion-components-preview'
import { Icon } from '@iconify/react'
import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface TomlViewerProps {
  data: any
  error: Error | null
  expandAll?: boolean
  collapseAll?: boolean
  onExpandStateChange?: () => void
  onAnimationStart?: () => void
  onAnimationEnd?: () => void
}

type NodeType =
  | 'object'
  | 'array'
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | 'null'
  | 'undefined'

type NodeDetailedType =
  | Exclude<NodeType, 'number'>
  | 'integer'
  | 'float'
  | 'inf'
  | 'nan'

interface TreeNode {
  key: string
  name: string
  value: any
  type: NodeType
  children?: TreeNode[]
  isExpanded?: boolean
  parent?: TreeNode
  path: string
  arrayIndex?: number
}

const useStyles = makeStyles({
  container: {
    padding: '0',
    height: '100%',
    width: '100%',
    overflowY: 'auto',
    overflowX: 'auto',
    backgroundColor: tokens.colorNeutralBackground1,
  },
  placeholder: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    gap: '12px',
    color: tokens.colorNeutralForeground3,
  },
  error: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    gap: '12px',
    padding: '20px',
    color: tokens.colorPaletteRedForeground1,
  },
  treeRow: {
    display: 'flex',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: tokens.colorNeutralBackground2,
    },
  },
  treeInner: {
    margin: '3px 0',
    display: 'flex',
    alignItems: 'start',
  },
  indentLineContainer: {
    marginLeft: '7px',
    marginRight: '10px',
    display: 'flex',
  },
  indentLine: {
    width: '1px',
    backgroundColor: tokens.colorNeutralStroke2,
  },
  expander: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '15px',
    height: '20px',
    cursor: 'pointer',
    marginRight: '2px',
  },
  iconContainer: {
    display: 'flex',
    alignItems: 'center',
    marginRight: '4px',
    color: tokens.colorNeutralForeground3,
  },
  keyName: {
    display: 'flex',
    alignItems: 'center',
    color: tokens.colorPaletteBlueForeground2,
    fontWeight: tokens.fontWeightSemibold,
    marginRight: '.5ch',
    whiteSpace: 'pre',
  },
  arrayIndex: {
    color: tokens.colorNeutralForeground3,
    marginRight: '.5ch',
  },
  equalToken: {
    color: tokens.colorNeutralForeground3,
    marginRight: '.5ch',
  },
  stringValue: {
    color: tokens.colorPaletteRedForeground1,
    whiteSpace: 'pre',
  },
  stringQuote: {
    '::before': {
      content: "'\"'",
      color: tokens.colorPaletteRedForeground2,
      opacity: 0.5,
    },
  },
  numberValue: {
    color: tokens.colorPaletteGreenForeground2,
  },
  booleanValue: {
    color: tokens.colorPalettePurpleForeground2,
  },
  dateValue: {
    color: tokens.colorPaletteYellowForeground2,
  },
  nullValue: {
    color: tokens.colorNeutralForeground3,
    fontStyle: 'italic',
  },
  objectSummary: {
    color: tokens.colorNeutralForeground3,
    fontSize: tokens.fontSizeBase200,
  },
})

const animDuration = 200
const Collapse = createPresenceComponent(
  createCollapsePresence({
    enterDuration: animDuration,
  }),
)

// 递归构建树形结构
function buildTree(data: any, parentPath = '', _isRoot = true): TreeNode[] {
  if (data === null || data === undefined) {
    return []
  }

  const result: TreeNode[] = []

  if (Array.isArray(data)) {
    // 处理数组
    data.forEach((item, index) => {
      const path = parentPath ? `${parentPath}[${index}]` : `[${index}]`
      const nodeType = getNodeType(item)

      const node: TreeNode = {
        key: path,
        name: '',
        value: item,
        type: nodeType,
        arrayIndex: index,
        path,
        isExpanded: true, // 默认展开
      }

      if (nodeType === 'object' || nodeType === 'array') {
        node.children = buildTree(item, path, false)
        node.isExpanded = true // 默认展开
      }

      result.push(node)
    })
  } else if (typeof data === 'object') {
    // 处理对象
    Object.entries(data).forEach(([key, value]) => {
      const path = parentPath ? `${parentPath}.${key}` : key
      const nodeType = getNodeType(value)

      const node: TreeNode = {
        key,
        name: key,
        value,
        type: nodeType,
        path,
        isExpanded: true, // 默认展开
      }

      if (nodeType === 'object' || nodeType === 'array') {
        node.children = buildTree(value, path, false)
        node.isExpanded = true // 默认展开
      }

      result.push(node)
    })
  }

  return result
}

// 收集所有节点路径
function collectAllPaths(nodes: TreeNode[]): string[] {
  let paths: string[] = []

  for (const node of nodes) {
    paths.push(node.path)
    if (node.children && node.children.length > 0) {
      paths = paths.concat(collectAllPaths(node.children))
    }
  }

  return paths
}

// 按照层级收集所有节点路径（从深到浅）
function collectPathsByDepth(nodes: TreeNode[], fromDeep: boolean = false): string[][] {
  const pathsByDepth: Record<number, string[]> = {}
  const maxDepth = { value: 0 }

  // 递归函数来收集每个深度层级的路径
  const collect = (node: TreeNode, depth: number) => {
    if (!pathsByDepth[depth]) {
      pathsByDepth[depth] = []
    }

    pathsByDepth[depth].push(node.path)
    maxDepth.value = Math.max(maxDepth.value, depth)

    if (node.children && node.children.length > 0) {
      node.children.forEach((child) => collect(child, depth + 1))
    }
  }

  // 对每个顶层节点调用收集函数
  nodes.forEach((node) => collect(node, 0))

  // 将对象转换为数组，从最深层到最浅层
  const result: string[][] = []
  if (fromDeep) {
    for (let i = maxDepth.value; i >= 0; i--) {
      if (pathsByDepth[i] && pathsByDepth[i].length > 0) {
        result.push(pathsByDepth[i])
      }
    }
  } else {
    for (let i = 0; i <= maxDepth.value; i++) {
      if (pathsByDepth[i] && pathsByDepth[i].length > 0) {
        result.push(pathsByDepth[i])
      }
    }
  }

  return result
}

// 获取数据类型
function getNodeType(value: any): NodeType {
  if (value === null) return 'null'
  if (value === undefined) return 'undefined'
  if (typeof value === 'string') return 'string'
  if (typeof value === 'number') return 'number'
  if (typeof value === 'boolean') return 'boolean'
  if (value instanceof Date) return 'date'
  if (Array.isArray(value)) return 'array'
  if (typeof value === 'object') return 'object'
  return 'string' // 默认
}

const NumberSymbolFloat20Regular = createFluentIcon(
  'NumberSymbolFloat20Regular',
  '20',
  [
    'M 8.99 2.6 C 9.067 2.223 8.707 1.904 8.342 2.026 C 8.172 2.082 8.046 2.225 8.01 2.4 L 7.09 7 L 3.5 7 C 3.115 7 2.875 7.417 3.067 7.75 C 3.156 7.905 3.321 8 3.5 8 L 6.89 8 L 6.09 12 L 2.5 12 C 2.115 12 1.875 12.417 2.067 12.75 C 2.156 12.905 2.321 13 2.5 13 L 5.9 13 L 5 17.4 C 4.923 17.777 5.283 18.096 5.648 17.974 C 5.818 17.918 5.944 17.775 5.98 17.6 L 6.9 13 L 9.2 13 C 9.3 12.65 9.43 12.31 9.6 12 L 7.1 12 L 7.9 8 L 12.93 8 L 12.66 9.31 C 13 9.19 13.36 9.11 13.74 9.05 L 13.96 8 L 17.5 8 C 17.885 8 18.125 7.583 17.933 7.25 C 17.844 7.095 17.679 7 17.5 7 L 14.17 7 L 15.07 2.61 C 15.147 2.233 14.787 1.914 14.422 2.036 C 14.252 2.092 14.126 2.235 14.09 2.41 L 13.14 7.01 L 8.11 7.01 L 8.99 2.6 Z M 19 14.5 C 19 11.036 15.25 8.871 12.25 10.603 C 10.858 11.407 10 12.892 10 14.5 C 10 17.964 13.75 20.129 16.75 18.397 C 18.142 17.593 19 16.108 19 14.5 Z',
  ],
)

// 获取图标组件
function getNodeIcon(type: NodeDetailedType) {
  switch (type) {
    case 'string':
      return <TextWholeWord20Regular />
    case 'integer':
      return <NumberSymbol20Regular />
    case 'float':
      return <NumberSymbolFloat20Regular />
    case 'inf':
      return <Icon icon="ph:infinity" fontSize={20} />
    case 'boolean':
      return <CheckboxChecked20Regular />
    case 'date':
      return <Calendar20Regular />
    case 'array':
      return <TextBulletListLtr20Regular />
    case 'object':
      return <FolderList20Regular />
    case 'null':
    case 'undefined':
    case 'nan':
      return <DismissCircle20Regular />
    default:
      return <Document20Regular />
  }
}

function detailedType(type: NodeType, value: any): NodeDetailedType {
  if (type === 'number') {
    return Number.isNaN(value)
      ? 'nan'
      : Number.isFinite(value)
        ? Number.isInteger(value)
          ? 'integer'
          : 'float'
        : 'inf'
  }
  return type
}

export const TomlViewer: React.FC<TomlViewerProps> = ({
  data,
  error,
  expandAll,
  collapseAll,
  onExpandStateChange,
  onAnimationStart,
  onAnimationEnd,
}) => {
  const styles = useStyles()
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({})
  const { t, i18n } = useTranslation()

  // 切换节点展开状态
  const toggleNode = useCallback(
    (path: string) => {
      onAnimationStart?.()
      setExpandedNodes((prev) => {
        const newState = {
          ...prev,
          [path]: !prev[path],
        }
        if (onExpandStateChange) onExpandStateChange()
        return newState
      })
      onAnimationEnd?.()
    },
    [onExpandStateChange],
  )

  // 处理全部展开
  useEffect(() => {
    if (!(expandAll && data)) {
      return
    }

    const treeData = buildTree(data)
    const pathsByDepth = collectPathsByDepth(treeData)

    const abortSignal = new AbortController()

    // 使用 setTimeout 来分层次展开节点
    const expandByLayers = (layers: string[][], currentIndex = 0) => {
      if (currentIndex >= layers.length) {
        if (onExpandStateChange) onExpandStateChange()
        onAnimationEnd?.()
        return
      }

      // 展开当前层的所有节点
      setExpandedNodes((prev) => {
        const newState = { ...prev }
        layers[currentIndex].forEach((path) => {
          newState[path] = true
        })
        return newState
      })

      // 延迟一小段时间后展开下一层
      setTimeout(() => {
        if (!abortSignal.signal.aborted) {
          expandByLayers(layers, currentIndex + 1)
        }
      }, animDuration)
    }

    // 开始从内层到外层的展开过程
    onAnimationStart?.()
    expandByLayers(
      pathsByDepth
        .map((paths) => paths.filter((path) => expandedNodes[path] === false))
        .filter((paths) => paths.length > 0),
    )

    return () => {
      abortSignal.abort()
      onAnimationEnd?.()
    }
  }, [expandAll, data, onExpandStateChange])

  // 处理全部收起
  useEffect(() => {
    if (!(collapseAll && data)) {
      return
    }

    const treeData = buildTree(data)
    const allPaths = collectAllPaths(treeData)

    onAnimationStart?.()
    const collapsedState: Record<string, boolean> = {}
    allPaths.forEach((path) => {
      collapsedState[path] = false
    })
    setExpandedNodes(collapsedState)
    if (onExpandStateChange) onExpandStateChange()

    // 不知道这里的副作用为什么会立即被回收，搞不懂，摆烂
    onAnimationEnd?.()
  }, [collapseAll, data, onExpandStateChange])

  // 在数据变化时，预设所有节点为展开状态
  useEffect(() => {
    if (data) {
      const treeData = buildTree(data)
      const allPaths = collectAllPaths(treeData)

      const expandedState: Record<string, boolean> = {}
      allPaths.forEach((path) => {
        expandedState[path] = true
      })

      setExpandedNodes(expandedState)
    }
  }, [data])

  // 如果没有数据，显示占位符
  if ((!data || Object.keys(data).length === 0) && !error) {
    return (
      <div className={styles.container}>
        <div className={styles.placeholder}>
          <DocumentText20Regular fontSize={32} />
          <Text>{t('viewer.emptyMessage')}</Text>
        </div>
      </div>
    )
  }

  const localizeErrorMessage = (message: string) =>
    message.replace(
      /^Parse error on line (?<line>\d+), column (?<column>\d+): (?<message>[\s\S]+)$/,
      (...x) => {
        const {
          line,
          column,
          message: messageRaw,
        } = x[x.length - 1] as Record<string, string>

        type MsgReplacements = [
          string | RegExp,
          (o: Record<string, string>) => string,
        ][]
        const replaceOnce = (str: string, replacements: MsgReplacements) => {
          for (const [pattern, replacement] of replacements) {
            if (str.match(pattern)) {
              return str.replace(pattern, (...y) =>
                replacement(y[y.length - 1] as Record<string, string>),
              )
            }
          }
          return str
        }
        const msgReplacements: MsgReplacements = [
          [
            /^Single-line string cannot contain EOL$/,
            (o) => t('error.singleLineStringEOL', o),
          ],
          [
            /^Not closed by "(?<end>.+?)" after started with "(?<start>.+?)"$/,
            (o) => t('error.notClosedBy', o),
          ],
          [/^key\/value pair doesn't have "="$/, (o) => t('error.pairHasNotEqual', o)],
          [
            /(Parse error on line (\d+), column (\d+): )?Unexpected character: "(?<char>.+)"$/,
            (o) => t('error.unexpectedCharacter', o),
          ],
          [/^Array is not closed$/, (o) => t('error.arrayNotClosed', o)],
          [
            /^Invalid date string "(?<date>[\s\S]+)"$/,
            (o) => t('error.invalidDateString', o),
          ],
          [
            /^Cannot parse value on line '(?<line>[\s\S]+)'$/,
            (o) => t('error.canNotParseLineValue', o),
          ],
        ]

        return t('error.parseError', {
          line,
          column,
          message: replaceOnce(messageRaw, msgReplacements),
        })
      },
    )

  // 如果有错误，显示错误信息
  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <Text weight="semibold">{t('viewer.errorMessage')}</Text>
          {i18n.language !== 'en' && <Text>{localizeErrorMessage(error.message)}</Text>}
          <Text>{error.message}</Text>
        </div>
      </div>
    )
  }

  // 构建树形数据
  const treeData = buildTree(data)

  // 获取值的显示文本
  const getLocalizedValueText = (node: TreeNode): string => {
    const { value, type } = node

    switch (type) {
      case 'string':
        return value
      case 'number':
        return String(value)
      case 'boolean':
        return value ? t('viewer.value.true') : t('viewer.value.false')
      case 'date':
        return value.toISOString()
      case 'null':
        return t('viewer.value.null')
      case 'undefined':
        return t('viewer.value.undefined')
      // case 'array':
      //   return '[...]'
      // case 'object':
      //   return '{...}'
      default:
        return String(value)
    }
  }

  // 递归渲染树节点
  const renderNode = (
    node: TreeNode,
    depth: number,
    _parentIndex: number,
    _parentLength: number,
  ) => {
    const isExpanded = expandedNodes[node.path] !== false // 默认为展开状态，除非明确设置为false
    const hasChildren = node.children && node.children.length > 0
    const canHaveChildren = node.type === 'object' || node.type === 'array'

    const detailedTypeStr = detailedType(node.type, node.value)

    return (
      <React.Fragment key={node.path}>
        <div
          className={styles.treeRow}
          onClick={() => hasChildren && toggleNode(node.path)}
        >
          {depth > 0 && (
            <>
              {Array.from({ length: depth }, (_, i) => (
                <div className={styles.indentLineContainer} key={i}>
                  <div className={styles.indentLine}></div>
                </div>
              ))}
            </>
          )}

          <div className={styles.treeInner}>
            <div className={styles.expander}>
              {hasChildren &&
                (isExpanded ? <ChevronDown20Regular /> : <ChevronRight20Regular />)}
            </div>
            <div className={styles.iconContainer}>
              <Tooltip
                content={t(`viewer.type.${detailedTypeStr}`)}
                positioning="before"
              >
                {getNodeIcon(detailedTypeStr)}
              </Tooltip>
            </div>

            {node.arrayIndex !== undefined ? (
              (() => {
                const rem = node.arrayIndex % 10
                return (
                  <Tooltip
                    content={t('viewer.itemIndexInArray', {
                      place: node.arrayIndex + 1,
                      placeSuffix:
                        rem === 0 ? 'st' : rem === 1 ? 'nd' : rem === 2 ? 'rd' : 'th',
                      index: node.arrayIndex,
                    })}
                    positioning="before"
                  >
                    <span className={styles.arrayIndex}>[{node.arrayIndex}]</span>
                  </Tooltip>
                )
              })()
            ) : (
              <>
                {node.name && <span className={styles.keyName}>{node.name}</span>}
                {!canHaveChildren && <span className={styles.equalToken}> = </span>}
              </>
            )}

            {node.type === 'string' && (
              <div style={{ display: 'flex' }}>
                <div className={styles.stringQuote} />
                <span className={styles.stringValue}>
                  {getLocalizedValueText(node)}
                </span>
                <div className={styles.stringQuote} style={{ alignSelf: 'end' }} />
              </div>
            )}
            {node.type === 'number' && (
              <span className={styles.numberValue}>{getLocalizedValueText(node)}</span>
            )}
            {node.type === 'boolean' && (
              <span className={styles.booleanValue}>{getLocalizedValueText(node)}</span>
            )}
            {node.type === 'date' && (
              <span className={styles.dateValue}>{getLocalizedValueText(node)}</span>
            )}
            {(node.type === 'null' || node.type === 'undefined') && (
              <span className={styles.nullValue}>{getLocalizedValueText(node)}</span>
            )}
            {canHaveChildren && (
              <span className={styles.objectSummary}>
                {node.type === 'object'
                  ? node.children!.length > 1
                    ? t('viewer.objectProperties', { count: node.children!.length })
                    : t('viewer.objectProperty', { count: node.children!.length })
                  : node.value.length > 1
                    ? t('viewer.arrayItems', { count: node.value.length })
                    : t('viewer.arrayItem', { count: node.value.length })}
              </span>
            )}
          </div>
        </div>

        {hasChildren && (
          <Collapse visible={isExpanded}>
            <div>
              {node.children!.map((child, index, lst) =>
                renderNode(child, depth + 1, index, lst.length),
              )}
            </div>
          </Collapse>
        )}
      </React.Fragment>
    )
  }

  return (
    <div className={styles.container}>
      {treeData.map((node, index, lst) => renderNode(node, 0, index, lst.length))}
    </div>
  )
}
