import { makeStyles, Text, tokens } from '@fluentui/react-components'
import {
  Calendar20Regular,
  CheckboxChecked20Regular,
  ChevronDown20Regular,
  ChevronRight20Regular,
  CodeText20Regular,
  DismissSquare20Regular,
  DocumentText20Regular,
  NumberSymbol20Regular,
  TextBulletListLtr20Regular,
} from '@fluentui/react-icons'
import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface TomlViewerProps {
  data: any
  error: Error | null
  expandAll?: boolean
  collapseAll?: boolean
  onExpandStateChange?: () => void
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
    alignItems: 'center',
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

// 获取图标组件
function getNodeIcon(type: NodeType) {
  switch (type) {
    case 'string':
      return <CodeText20Regular />
    case 'number':
      return <NumberSymbol20Regular />
    case 'boolean':
      return <CheckboxChecked20Regular />
    case 'date':
      return <Calendar20Regular />
    case 'array':
      return <TextBulletListLtr20Regular />
    case 'object':
      return <DocumentText20Regular />
    case 'null':
    case 'undefined':
      return <DismissSquare20Regular />
    default:
      return <DocumentText20Regular />
  }
}

export const TomlViewer: React.FC<TomlViewerProps> = ({
  data,
  error,
  expandAll,
  collapseAll,
  onExpandStateChange,
}) => {
  const styles = useStyles()
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({})
  const { t, i18n } = useTranslation()

  // 切换节点展开状态
  const toggleNode = useCallback(
    (path: string) => {
      setExpandedNodes((prev) => {
        const newState = {
          ...prev,
          [path]: !prev[path],
        }
        if (onExpandStateChange) onExpandStateChange()
        return newState
      })
    },
    [onExpandStateChange],
  )

  // 处理全部展开
  useEffect(() => {
    if (expandAll && data) {
      const treeData = buildTree(data)
      const allPaths = collectAllPaths(treeData)

      const expandedState: Record<string, boolean> = {}
      allPaths.forEach((path) => {
        expandedState[path] = true
      })

      setExpandedNodes(expandedState)
      if (onExpandStateChange) onExpandStateChange()
    }
  }, [expandAll, data, onExpandStateChange])

  // 处理全部收起
  useEffect(() => {
    if (collapseAll && data) {
      const treeData = buildTree(data)
      const allPaths = collectAllPaths(treeData)

      const collapsedState: Record<string, boolean> = {}
      allPaths.forEach((path) => {
        collapsedState[path] = false
      })

      setExpandedNodes(collapsedState)
      if (onExpandStateChange) onExpandStateChange()
    }
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
        return `"${value}"`
      case 'number':
        return String(value)
      case 'boolean':
        return value ? t('viewer.booleanTrue') : t('viewer.booleanFalse')
      case 'date':
        return value.toISOString()
      case 'null':
        return 'null'
      case 'undefined':
        return 'undefined'
      case 'array':
        return '[...]'
      case 'object':
        return '{...}'
      default:
        return String(value)
    }
  }

  // 递归渲染树节点
  const renderNode = (node: TreeNode, level = 0, _isLastChild = true) => {
    const isExpanded = expandedNodes[node.path] !== false // 默认为展开状态，除非明确设置为false
    const hasChildren = node.children && node.children.length > 0
    const canHaveChildren = node.type === 'object' || node.type === 'array'

    return (
      <React.Fragment key={node.path}>
        <div
          className={styles.treeRow}
          onClick={() => hasChildren && toggleNode(node.path)}
        >
          {level > 0 && (
            <>
              {Array.from({ length: level }, () => (
                <div className={styles.indentLineContainer}>
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
            <div className={styles.iconContainer}>{getNodeIcon(node.type)}</div>

            {node.arrayIndex !== undefined ? (
              <span className={styles.arrayIndex}>[{node.arrayIndex}]</span>
            ) : (
              <>
                {node.name && <span className={styles.keyName}>{node.name}</span>}
                {!canHaveChildren && <span className={styles.equalToken}> = </span>}
              </>
            )}

            {node.type === 'string' && (
              <span className={styles.stringValue}>{getLocalizedValueText(node)}</span>
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

        {hasChildren && isExpanded && (
          <div>
            {node.children!.map((child, index) =>
              renderNode(child, level + 1, index === node.children!.length - 1),
            )}
          </div>
        )}
      </React.Fragment>
    )
  }

  return (
    <div className={styles.container}>
      {treeData.map((node, index) =>
        renderNode(node, 0, index === treeData.length - 1),
      )}
    </div>
  )
}
