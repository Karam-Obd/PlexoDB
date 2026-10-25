import type { TSocketSide } from '../meta/t-socket-side'

function calculateCubicBezierPath(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  side1: TSocketSide = 'right',
  side2: TSocketSide = 'left'
): string {
  const dx = Math.abs(x2 - x1)
  const curvature = Math.max(dx * 0.5, 40)

  const cx1 = side1 === 'right' ? x1 + curvature : x1 - curvature
  const cy1 = y1
  const cx2 = side2 === 'left' ? x2 - curvature : x2 + curvature
  const cy2 = y2

  return `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`
}

function getSocketSides(
  sourceCenterX: number,
  targetCenterX: number
): { sourceSide: TSocketSide; targetSide: TSocketSide } {
  const isSourceLeft = sourceCenterX < targetCenterX
  return {
    sourceSide: isSourceLeft ? 'right' : 'left',
    targetSide: isSourceLeft ? 'left' : 'right'
  }
}

function getPointOnCubicBezier(
  t: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  side1: TSocketSide = 'right',
  side2: TSocketSide = 'left'
): { x: number; y: number } {
  const dx = Math.abs(x2 - x1)
  const curvature = Math.max(dx * 0.5, 40)

  const cx1 = side1 === 'right' ? x1 + curvature : x1 - curvature
  const cy1 = y1
  const cx2 = side2 === 'left' ? x2 - curvature : x2 + curvature
  const cy2 = y2

  const u = 1 - t
  const tt = t * t
  const uu = u * u
  const uuu = uu * u
  const ttt = tt * t

  const x = uuu * x1 + 3 * uu * t * cx1 + 3 * u * tt * cx2 + ttt * x2
  const y = uuu * y1 + 3 * uu * t * cy1 + 3 * u * tt * cy2 + ttt * y2

  return { x, y }
}

export { calculateCubicBezierPath, getSocketSides, getPointOnCubicBezier }
