import { MutationActionEnum } from '../enums/mutation-action'
import { StreamEventTypeEnum } from '../enums/stream-event-type'
import type { IRelationEdge } from './i-relation-edge'
import type { ITableNode } from './i-table-node'

type TStreamEvent =
  | {
      id: string
      type: StreamEventTypeEnum.SCHEMA_SNAPSHOT
      timestamp: number
      payload: {
        tables: ITableNode[]
        edges: IRelationEdge[]
        databaseName?: string
        latencyMs?: number
        channel?: string
      }
    }
  | {
      id: string
      type: StreamEventTypeEnum.SCHEMA_MUTATED
      timestamp: number
      payload: {
        tables: ITableNode[]
        edges: IRelationEdge[]
        diffDescription: string
        query?: string
        latencyMs?: number
        channel?: string
      }
    }
  | {
      id: string
      type: StreamEventTypeEnum.ROW_MUTATED
      timestamp: number
      payload: {
        tableId: string
        action: MutationActionEnum
        row: Record<string, unknown>
        previousData?: Record<string, unknown>
        query?: string
        latencyMs?: number
        channel?: string
        relatedEdgeIds: string[]
      }
    }

type TEventSubscription = (event: TStreamEvent) => void
type TUnsubscribe = () => void

export type { TStreamEvent, TEventSubscription, TUnsubscribe }
