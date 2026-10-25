import { create } from 'zustand'
import { RelationEdge } from '../core/def/relation-edge'
import { TableNode } from '../core/def/table-node'
import type { IRelationEdge } from '../core/meta/i-relation-edge'
import type { ITableNode } from '../core/meta/i-table-node'
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
  }
}))

export { useSchemaStore }
