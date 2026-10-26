import { create } from 'zustand'
import { RelationEdge } from '../core/def/relation-edge'
import { TableNode } from '../core/def/table-node'
import { StreamEventTypeEnum } from '../core/enums/stream-event-type'
import type { IRelationEdge } from '../core/meta/i-relation-edge'
import type { ITableNode } from '../core/meta/i-table-node'
import type { TStreamEvent } from '../core/meta/t-event'
import { useLedgerStore } from './ledger-store'
import mockSchema from '../core/mock/mock-schema.json'

type TSchemaStore = {
  tableIds: string[]
  tables: Record<string, ITableNode>
  edges: IRelationEdge[]
  setTables: (tables: ITableNode[]) => void
  addTable: (table: ITableNode) => void
  removeTable: (tableId: string) => void
  updateTablePosition: (tableId: string, x: number, y: number) => void
  setEdges: (edges: IRelationEdge[]) => void
  addEdge: (edge: IRelationEdge) => void
  removeEdge: (edgeId: string) => void
  applyMutation: (event: TStreamEvent) => void
}

const useSchemaStore = create<TSchemaStore>(set => ({
  tableIds: mockSchema.tables.map(table => table.id),
  tables: mockSchema.tables.reduce<Record<string, ITableNode>>((acc, tableData) => {
    const table = new TableNode(tableData as unknown as Partial<ITableNode>)
    acc[table.id] = table
    return acc
  }, {}),
  edges: mockSchema.edges.map(edgeData => new RelationEdge(edgeData as unknown as Partial<IRelationEdge>)),

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
      table.position.x = x
      table.position.y = y
      return {
        tables: {
          ...state.tables,
          [tableId]: table
        }
      }
    })
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
      set({
        tableIds: event.payload.tables.map(table => table.id),
        tables: event.payload.tables.reduce<Record<string, ITableNode>>((acc, tableData) => {
          const table = new TableNode(tableData as unknown as Partial<ITableNode>)
          acc[table.id] = table
          return acc
        }, {}),
        edges: event.payload.edges.map(edgeData => new RelationEdge(edgeData as unknown as Partial<IRelationEdge>))
      })
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

        const nextEdges = event.payload.edges.map(
          edgeData => new RelationEdge(edgeData as unknown as Partial<IRelationEdge>)
        )

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
