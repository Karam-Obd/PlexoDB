import { create } from 'zustand'
import { RelationEdge } from '../core/def/relation-edge'
import { TableNode } from '../core/def/table-node'
import { StreamEventTypeEnum } from '../core/enums/stream-event-type'
import { calculateAutoLayout } from '../core/utils/layout'
import type { IRelationEdge } from '../core/meta/i-relation-edge'
import type { ITableNode } from '../core/meta/i-table-node'
import type { TStreamEvent } from '../core/meta/t-event'
import type { TSchemaStore } from '../core/meta/t-store'
import { useLedgerStore } from './ledger-store'
import { useCanvasStore } from './canvas-store'
import mockSchema from '../core/mock/mock-schema.json'

const initialTables = mockSchema.tables.reduce<Record<string, ITableNode>>((acc, tableData) => {
  const table = new TableNode(tableData as unknown as Partial<ITableNode>)
  acc[table.id] = table
  return acc
}, {})
const initialEdges = mockSchema.edges.map(edgeData => new RelationEdge(edgeData as unknown as Partial<IRelationEdge>))
const initialPositions = calculateAutoLayout(Object.values(initialTables), initialEdges)
for (const [id, pos] of Object.entries(initialPositions)) {
  if (initialTables[id]) {
    initialTables[id].position = { ...pos }
  }
}

const useSchemaStore = create<TSchemaStore>((set, get) => ({
  tableIds: mockSchema.tables.map(table => table.id),
  tables: initialTables,
  edges: initialEdges,

  setTables: (tables: ITableNode[]) => {
    set({
      tableIds: tables.map(table => table.id),
      tables: tables.reduce<Record<string, ITableNode>>((acc, table) => {
        acc[table.id] = table
        return acc
      }, {})
    })
  },

  addTable: (table: ITableNode) => {
    set(state => ({
      tableIds: state.tableIds.includes(table.id) ? state.tableIds : [...state.tableIds, table.id],
      tables: {
        ...state.tables,
        [table.id]: table
      }
    }))
  },

  removeTable: (tableId: string) => {
    set(state => {
      const nextTables = { ...state.tables }
      delete nextTables[tableId]
      const nextEdges = state.edges.filter(edge => edge.sourceTableId !== tableId && edge.targetTableId !== tableId)
      return {
        tableIds: state.tableIds.filter(id => id !== tableId),
        tables: nextTables,
        edges: nextEdges
      }
    })
  },

  updateTablePosition: (tableId: string, x: number, y: number) => {
    set(state => {
      const table = state.tables[tableId]
      if (!table) return state
      return {
        tables: {
          ...state.tables,
          [tableId]: new TableNode({
            ...table,
            position: { x, y }
          })
        }
      }
    })
  },

  autoArrange: () => {
    const { tables, edges } = get()
    const positions = calculateAutoLayout(Object.values(tables), edges)
    const nextTables: Record<string, ITableNode> = {}
    for (const [id, table] of Object.entries(tables)) {
      const pos = positions[id] ?? table.position
      nextTables[id] = new TableNode({
        ...table,
        position: { ...pos }
      })
    }
    set({ tables: nextTables })
    useCanvasStore.getState().centerContent(Object.values(nextTables))
  },

  setEdges: (edges: IRelationEdge[]) => {
    set({ edges })
  },

  addEdge: (edge: IRelationEdge) => {
    set(state => ({
      edges: [...state.edges, edge]
    }))
  },

  removeEdge: (edgeId: string) => {
    set(state => ({
      edges: state.edges.filter(edge => edge.id !== edgeId)
    }))
  },

  applyMutation: (event: TStreamEvent) => {
    useLedgerStore.getState().pushEvent(event)

    if (event.type === StreamEventTypeEnum.SCHEMA_SNAPSHOT) {
      const incomingTables = event.payload.tables.reduce<Record<string, ITableNode>>((acc, tableData) => {
        const table = new TableNode(tableData as unknown as Partial<ITableNode>)
        acc[table.id] = table
        return acc
      }, {})
      const incomingEdges = event.payload.edges.map(edgeData => new RelationEdge(edgeData as unknown as Partial<IRelationEdge>))

      const positions = calculateAutoLayout(Object.values(incomingTables), incomingEdges)
      for (const [id, pos] of Object.entries(positions)) {
        if (incomingTables[id]) {
          incomingTables[id].position = { ...pos }
        }
      }

      set({
        tableIds: event.payload.tables.map(table => table.id),
        tables: incomingTables,
        edges: incomingEdges
      })
      useCanvasStore.getState().centerContent(Object.values(incomingTables))
      return
    }

    if (event.type === StreamEventTypeEnum.SCHEMA_MUTATED) {
      set(state => {
        const nextTables: Record<string, ITableNode> = {}

        event.payload.tables.forEach(incomingTableData => {
          const existingTable = state.tables[incomingTableData.id]
          const tableNode = new TableNode(incomingTableData as unknown as Partial<ITableNode>)

          if (existingTable) {
            tableNode.position = { ...existingTable.position }
            tableNode.rowCount = existingTable.rowCount
          }

          nextTables[tableNode.id] = tableNode
        })

        const nextEdges = event.payload.edges.map(edgeData => new RelationEdge(edgeData as unknown as Partial<IRelationEdge>))

        return {
          tableIds: event.payload.tables.map(table => table.id),
          tables: nextTables,
          edges: nextEdges
        }
      })
      return
    }

    if (event.type === StreamEventTypeEnum.ROW_MUTATED) {
      const { tableId, action, relatedEdgeIds } = event.payload

      set(state => {
        const currentTable = state.tables[tableId]
        if (!currentTable) return state

        const updatedTable = new TableNode(currentTable as unknown as Partial<ITableNode>)
        updatedTable.registerMutation(action)

        const nextEdges = state.edges.map(edge => {
          if (relatedEdgeIds.includes(edge.id)) {
            const pulsedEdge = new RelationEdge(edge as unknown as Partial<IRelationEdge>)
            pulsedEdge.triggerPulse()
            return pulsedEdge
          }
          return edge
        })

        return {
          tables: {
            ...state.tables,
            [tableId]: updatedTable
          },
          edges: nextEdges
        }
      })
    }
  }
}))

export { useSchemaStore }
