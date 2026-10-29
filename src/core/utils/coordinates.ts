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

export {
  screenToWorld,
  worldToScreen,
  getSocketCoordinates,
  getEffectiveGrid,
  getDotRadius,
  CARD_WIDTH,
  HEADER_OFFSET,
  ROW_HEIGHT
}
