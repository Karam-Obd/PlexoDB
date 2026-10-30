import type { ConnectionStatusEnum } from '../enums/connection-status'
import type { ThemeEnum } from '../enums/theme'
import type { IDataStreamProvider } from './i-data-stream-provider'
import type { IModal } from './i-modal'
import type { IRelationEdge } from './i-relation-edge'
import type { ITableNode } from './i-table-node'
import type { TStreamEvent } from './t-event'
import type { TNullable } from './t-shared'
import type { TViewportState } from './t-viewport-state'

type TFocalPoint = {
  clientX: number
  clientY: number
}

type TCanvasStore = {
  viewport: TViewportState
  theme: ThemeEnum
  setViewport: (viewport: TViewportState) => void
  pan: (dx: number, dy: number) => void
  zoom: (delta: number, focalPoint?: TFocalPoint) => void
  centerContent: (tables: ITableNode[]) => void
  resetViewport: () => void
  setTheme: (theme: ThemeEnum) => void
  toggleTheme: () => void
}

type TConnectionStore = {
  status: ConnectionStatusEnum
  target: string
  isPaused: boolean
  provider: TNullable<IDataStreamProvider>
  setStatus: (status: ConnectionStatusEnum, target?: string) => void
  setConnected: (target: string, provider?: IDataStreamProvider) => void
  setDisconnected: () => void
  setProvider: (provider: TNullable<IDataStreamProvider>) => void
  togglePause: () => void
}

type TLedgerStore = {
  events: TStreamEvent[]
  selectedTableId: TNullable<string>
  pushEvent: (event: TStreamEvent) => void
  setSelectedTableId: (id: TNullable<string>) => void
  clearEvents: () => void
}

type TModalsStore = {
  modalIds: string[]
  modals: Record<string, IModal>
  registerModal: (id: string, modal: IModal) => void
  unregisterModal: (id: string) => void
  toggleModal: (id: string) => void
}

type TSchemaStore = {
  tableIds: string[]
  tables: Record<string, ITableNode>
  edges: IRelationEdge[]
  setTables: (tables: ITableNode[]) => void
  addTable: (table: ITableNode) => void
  removeTable: (tableId: string) => void
  updateTablePosition: (tableId: string, x: number, y: number) => void
  autoArrange: () => void
  setEdges: (edges: IRelationEdge[]) => void
  addEdge: (edge: IRelationEdge) => void
  removeEdge: (edgeId: string) => void
  applyMutation: (event: TStreamEvent) => void
}

export type {
  TFocalPoint,
  TCanvasStore,
  TConnectionStore,
  TLedgerStore,
  TModalsStore,
  TSchemaStore,
}
