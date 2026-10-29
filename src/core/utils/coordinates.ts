import type { ITableNode } from '../meta/i-table-node'
import type { TPosition } from '../meta/t-shared'
import type { TSocketSide } from '../meta/t-socket-side'
import type { TViewportState } from '../meta/t-viewport-state'

const CARD_WIDTH = 320
const HEADER_OFFSET = 45
const ROW_HEIGHT = 32

function screenToWorld(clientX: number, clientY: number, viewport: TViewportState): TPosition {
  return {
    x: (clientX - viewport.panX) / viewport.scale,
    y: (clientY - viewport.panY) / viewport.scale,
  }
}

function worldToScreen(worldX: number, worldY: number, viewport: TViewportState): TPosition {
  return {
    x: worldX * viewport.scale + viewport.panX,
    y: worldY * viewport.scale + viewport.panY,
  }
}

function getSocketCoordinates(
  table: ITableNode,
  fieldName: string,
  side: TSocketSide
): TPosition {
  const columnIndex = table.columns.findIndex(col => col.name === fieldName)
  const validIndex = columnIndex >= 0 ? columnIndex : 0

  const x = side === 'right' ? table.position.x + CARD_WIDTH : table.position.x
  const y = table.position.y + HEADER_OFFSET + validIndex * ROW_HEIGHT + ROW_HEIGHT / 2

  return { x, y }
}

function getEffectiveGrid(
  scale: number,
  baseGrid = 24,
  min = 16,
  max = 48
): number {
  const raw = baseGrid * scale
  if (raw <= 0) return baseGrid
  if (raw < min) {
    const factor = Math.pow(2, Math.ceil(Math.log2(min / raw)))
    return raw * factor
  }
  if (raw > max) {
    const factor = Math.pow(2, Math.ceil(Math.log2(raw / max)))
    return raw / factor
  }
  return raw
}

function getDotRadius(scale: number): number {
  return scale < 0.6 ? 1 : 1.25
}

function getCenterPan(
  tables: ITableNode[],
  scale: number,
  headerHeight = 60
): TPosition {
  if (tables.length === 0) return { x: 0, y: 0 }

  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity

  for (const t of tables) {
    const h = HEADER_OFFSET + Math.max(t.columns.length, 1) * ROW_HEIGHT
    if (t.position.x < minX) minX = t.position.x
    if (t.position.x + CARD_WIDTH > maxX) maxX = t.position.x + CARD_WIDTH
    if (t.position.y < minY) minY = t.position.y
    if (t.position.y + h > maxY) maxY = t.position.y + h
  }

  const cx = (minX + maxX) / 2
  const cy = (minY + maxY) / 2
  const winWidth = typeof window !== 'undefined' ? window.innerWidth : 1920
  const winHeight = typeof window !== 'undefined' ? window.innerHeight : 1080

  return {
    x: Math.round(winWidth / 2 - cx * scale),
    y: Math.round(headerHeight + (winHeight - headerHeight) / 2 - cy * scale)
  }
}

export {
  screenToWorld,
  worldToScreen,
  getSocketCoordinates,
  getEffectiveGrid,
  getDotRadius,
  getCenterPan,
  CARD_WIDTH,
  HEADER_OFFSET,
  ROW_HEIGHT
}
