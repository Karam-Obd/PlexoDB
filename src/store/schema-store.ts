import { create } from 'zustand'
import { RelationEdge } from '../core/def/relation-edge'
import { TableNode } from '../core/def/table-node'
import mockSchema from '../core/mock/mock-schema.json'

type TSchemaStore = {
  tableIds: string[]
  tables: Record<string, TableNode>
  edges: RelationEdge[]
  setTables: (tables: TableNode[]) => void
  addTable: (table: TableNode) => void
  removeTable: (tableId: string) => void
  updateTablePosition: (tableId: string, x: number, y: number) => void
  setEdges: (edges: RelationEdge[]) => void
  addEdge: (edge: RelationEdge) => void
  removeEdge: (edgeId: string) => void
}

const useSchemaStore = create<TSchemaStore>(set => ({
  tableIds: mockSchema.tables.map(table => table.id),
  tables: mockSchema.tables.reduce<Record<string, TableNode>>((acc, tableData) => {
    const table = new TableNode(tableData as unknown as Partial<TableNode>)
    acc[table.id] = table
    return acc
  }, {}),
  edges: mockSchema.edges.map(edgeData => new RelationEdge(edgeData as unknown as Partial<RelationEdge>)),

  setTables: (tables: TableNode[]) => {
    set({
      tableIds: tables.map(table => table.id),
      tables: tables.reduce<Record<string, TableNode>>((acc, table) => {
        acc[table.id] = table
        return acc
      }, {})
    })
  },

  addTable: (table: TableNode) => {
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
      table.updatePosition(x, y)
      return {
        tables: {
          ...state.tables,
          [tableId]: table
        }
      }
    })
  },

  setEdges: (edges: RelationEdge[]) => {
    set({ edges })
  },

  addEdge: (edge: RelationEdge) => {
    set(state => ({
      edges: [...state.edges, edge]
    }))
  },

  removeEdge: (edgeId: string) => {
    set(state => ({
      edges: state.edges.filter(edge => edge.id !== edgeId)
    }))
  }
}))

export { useSchemaStore }
