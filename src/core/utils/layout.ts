import type { IRelationEdge } from '../meta/i-relation-edge'
import type { ITableNode } from '../meta/i-table-node'
import type { TPosition } from '../meta/t-shared'
import { CARD_WIDTH, HEADER_OFFSET, ROW_HEIGHT } from './coordinates'

const CARD_PADDING = 8
const GAP_X = 100
const GAP_Y = 40
const COMPONENT_GAP_Y = 80
const START_X = 80
const START_Y = 80

function getTableHeight(table: ITableNode): number {
  const cols = table.columns?.length ?? 0
  return HEADER_OFFSET + Math.max(cols, 1) * ROW_HEIGHT + CARD_PADDING
}

function calculateAutoLayout(
  tables: ITableNode[],
  edges: IRelationEdge[]
): Record<string, TPosition> {
  const positions: Record<string, TPosition> = {}
  if (tables.length === 0) return positions

  if (tables.length === 1) {
    positions[tables[0].id] = { x: START_X, y: START_Y }
    return positions
  }

  const tableMap = new Map<string, ITableNode>()
  tables.forEach(t => tableMap.set(t.id, t))

  // 1. Build undirected adjacency for connected components
  const adj = new Map<string, Set<string>>()
  tables.forEach(t => adj.set(t.id, new Set()))

  const validEdges: IRelationEdge[] = []
  for (const edge of edges) {
    if (tableMap.has(edge.sourceTableId) && tableMap.has(edge.targetTableId)) {
      validEdges.push(edge)
      adj.get(edge.sourceTableId)!.add(edge.targetTableId)
      adj.get(edge.targetTableId)!.add(edge.sourceTableId)
    }
  }

  // 2. Discover connected components
  const visited = new Set<string>()
  const components: ITableNode[][] = []

  for (const table of tables) {
    if (visited.has(table.id)) continue
    const component: ITableNode[] = []
    const queue = [table.id]
    visited.add(table.id)

    while (queue.length > 0) {
      const currId = queue.shift()!
      const currTable = tableMap.get(currId)
      if (currTable) component.push(currTable)

      for (const neighborId of adj.get(currId) ?? []) {
        if (!visited.has(neighborId)) {
          visited.add(neighborId)
          queue.push(neighborId)
        }
      }
    }
    components.push(component)
  }

  // Separate multi-node connected components from standalone tables
  const connectedComponents = components.filter(c => c.length > 1)
  const standaloneTables = components.filter(c => c.length === 1).map(c => c[0])

  let currentComponentY = START_Y

  // 3. Layout each connected component hierarchically
  for (const component of connectedComponents) {
    const compTableIds = new Set(component.map(t => t.id))
    const compEdges = validEdges.filter(
      e => compTableIds.has(e.sourceTableId) && compTableIds.has(e.targetTableId)
    )

    // In-degree from parents: targetTableId (referenced/parent) -> sourceTableId (referencing/child)
    const inDegree = new Map<string, number>()
    const outEdges = new Map<string, string[]>()
    const inEdges = new Map<string, string[]>()

    for (const t of component) {
      inDegree.set(t.id, 0)
      outEdges.set(t.id, [])
      inEdges.set(t.id, [])
    }

    for (const edge of compEdges) {
      const parent = edge.targetTableId
      const child = edge.sourceTableId
      if (parent !== child && outEdges.has(parent) && inEdges.has(child)) {
        outEdges.get(parent)!.push(child)
        inEdges.get(child)!.push(parent)
        inDegree.set(child, (inDegree.get(child) ?? 0) + 1)
      }
    }

    // Roots: tables that are not dependent on any other table in this component
    const roots = component.filter(t => (inDegree.get(t.id) ?? 0) === 0).map(t => t.id)
    if (roots.length === 0 && component.length > 0) {
      // Handle cycle by picking the table with smallest inDegree
      let minIn = Infinity
      let bestRoot = component[0].id
      for (const t of component) {
        const deg = inDegree.get(t.id) ?? 0
        if (deg < minIn) {
          minIn = deg
          bestRoot = t.id
        }
      }
      roots.push(bestRoot)
    }

    // Assign topological ranks
    const rankMap = new Map<string, number>()
    for (const t of component) {
      rankMap.set(t.id, 0)
    }

    // Relax ranks across edges (bounded to avoid infinite loops on cycles)
    for (let iter = 0; iter < component.length; iter++) {
      let changed = false
      for (const edge of compEdges) {
        const parent = edge.targetTableId
        const child = edge.sourceTableId
        if (parent !== child && rankMap.has(parent) && rankMap.has(child)) {
          const pRank = rankMap.get(parent)!
          const cRank = rankMap.get(child)!
          if (cRank < pRank + 1) {
            rankMap.set(child, pRank + 1)
            changed = true
          }
        }
      }
      if (!changed) break
    }

    // Group tables by rank
    const rankGroups = new Map<number, ITableNode[]>()
    for (const t of component) {
      const rank = rankMap.get(t.id) ?? 0
      if (!rankGroups.has(rank)) {
        rankGroups.set(rank, [])
      }
      rankGroups.get(rank)!.push(t)
    }

    const sortedRanks = Array.from(rankGroups.keys()).sort((a, b) => a - b)

    // Calculate height of each column
    const columnHeights: number[] = []
    for (const r of sortedRanks) {
      const colTables = rankGroups.get(r)!
      let h = 0
      colTables.forEach((t, i) => {
        h += getTableHeight(t) + (i > 0 ? GAP_Y : 0)
      })
      columnHeights.push(h)
    }

    const maxColHeight = Math.max(...columnHeights, 0)

    // Place tables in columns
    sortedRanks.forEach((r, colIdx) => {
      const colTables = rankGroups.get(r)!
      const colHeight = columnHeights[colIdx]
      const colX = START_X + colIdx * (CARD_WIDTH + GAP_X)

      // Vertically center this column relative to the tallest column in this cluster
      let currentY = currentComponentY + (maxColHeight - colHeight) / 2

      // Sort tables vertically to minimize crossings:
      // Rank 0 sorted by name; subsequent ranks ordered by average parent Y
      if (colIdx > 0) {
        colTables.sort((a, b) => {
          const parentsA = inEdges.get(a.id) ?? []
          const parentsB = inEdges.get(b.id) ?? []
          const avgYA = parentsA.length > 0
            ? parentsA.reduce((sum, pid) => sum + (positions[pid]?.y ?? 0), 0) / parentsA.length
            : 0
          const avgYB = parentsB.length > 0
            ? parentsB.reduce((sum, pid) => sum + (positions[pid]?.y ?? 0), 0) / parentsB.length
            : 0
          return avgYA - avgYB
        })
      } else {
        colTables.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''))
      }

      for (const t of colTables) {
        positions[t.id] = {
          x: colX,
          y: Math.round(currentY)
        }
        currentY += getTableHeight(t) + GAP_Y
      }
    })

    currentComponentY += maxColHeight + COMPONENT_GAP_Y
  }

  // 4. Place standalone tables in a tidy grid below connected clusters
  if (standaloneTables.length > 0) {
    const colsCount = Math.min(Math.max(connectedComponents.length > 0 ? 3 : 2, 2), 4)
    let colIdx = 0
    let rowY = currentComponentY
    let maxRowH = 0

    standaloneTables.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''))

    for (let i = 0; i < standaloneTables.length; i++) {
      const t = standaloneTables[i]
      const x = START_X + colIdx * (CARD_WIDTH + GAP_X)
      positions[t.id] = { x, y: Math.round(rowY) }

      const h = getTableHeight(t)
      if (h > maxRowH) maxRowH = h

      colIdx++
      if (colIdx >= colsCount) {
        colIdx = 0
        rowY += maxRowH + GAP_Y
        maxRowH = 0
      }
    }
  }

  return positions
}

export { calculateAutoLayout }

