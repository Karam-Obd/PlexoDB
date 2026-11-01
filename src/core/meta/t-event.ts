import { MutationActionEnum } from '../enums/mutation-action'
import { StreamEventTypeEnum } from '../enums/stream-event-type'
import type { IRelationEdge } from './i-relation-edge'
import type { ITableNode } from './i-table-node'

type TSchemaSnapshotPayload = {
  tables: ITableNode[]
  edges: IRelationEdge[]
  databaseName?: string
  latencyMs?: number
  channel?: string
}

type TSchemaSnapshotEvent = {
  id: string
  type: StreamEventTypeEnum.SCHEMA_SNAPSHOT
  timestamp: number
  payload: TSchemaSnapshotPayload
}

type TSchemaMutatedPayload = {
  tables: ITableNode[]
  edges: IRelationEdge[]
  diffDescription: string
  query?: string
  latencyMs?: number
  channel?: string
}

type TSchemaMutatedEvent = {
  id: string
  type: StreamEventTypeEnum.SCHEMA_MUTATED
  timestamp: number
  payload: TSchemaMutatedPayload
}

type TRowMutatedPayload = {
  tableId: string
  action: MutationActionEnum
  row: Record<string, unknown>
  previousData?: Record<string, unknown>
  query?: string
  latencyMs?: number
  channel?: string
  relatedEdgeIds: string[]
}

type TRowMutatedEvent = {
  id: string
  type: StreamEventTypeEnum.ROW_MUTATED
  timestamp: number
  payload: TRowMutatedPayload
}

type TStreamEvent = TSchemaSnapshotEvent | TSchemaMutatedEvent | TRowMutatedEvent
type TEventSubscription = (event: TStreamEvent) => void
type TUnsubscribe = () => void

export type { TSchemaSnapshotPayload, TSchemaSnapshotEvent, TSchemaMutatedPayload, TSchemaMutatedEvent, TRowMutatedPayload, TRowMutatedEvent, TStreamEvent, TEventSubscription, TUnsubscribe }
