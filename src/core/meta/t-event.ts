import { DataTypeEnum } from '../enums/data-type'
import { KeyTypeEnum } from '../enums/key-type'
import { MutationActionEnum } from '../enums/mutation-action'
import { SchemaActionEnum } from '../enums/schema-action'
import { StreamEventTypeEnum } from '../enums/stream-event-type'
import type { IRelationEdge } from './i-relation-edge'
import type { ITableNode } from './i-table-node'
import type { TNullable } from './t-shared'

type TAlteredColumn = {
  name: string
  dataType: DataTypeEnum
  keyType?: KeyTypeEnum
  action: MutationActionEnum
  previousDataType?: DataTypeEnum
}

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
  action: SchemaActionEnum
  targetTableId?: string
  alteredColumns?: TAlteredColumn[]
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
  row: TNullable<Record<string, unknown>>
  previousData?: TNullable<Record<string, unknown>>
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

export type { TAlteredColumn, TSchemaSnapshotPayload, TSchemaSnapshotEvent, TSchemaMutatedPayload, TSchemaMutatedEvent, TRowMutatedPayload, TRowMutatedEvent, TStreamEvent, TEventSubscription, TUnsubscribe }
