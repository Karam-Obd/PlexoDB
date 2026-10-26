import { Base } from './base'
import { MutationActionEnum } from '../enums/mutation-action'
import { StreamEventTypeEnum } from '../enums/stream-event-type'
import type { IDataStreamProvider } from '../meta/i-data-stream-provider'
import type { IRelationEdge } from '../meta/i-relation-edge'
import type { ITableNode } from '../meta/i-table-node'
import type { TEventSubscription, TStreamEvent, TUnsubscribe } from '../meta/t-event'
import mockSchema from '../mock/mock-schema.json'

class MockProvider extends Base<IDataStreamProvider> implements IDataStreamProvider {
  private subscribers: Set<TEventSubscription> = new Set()
  private timerId: ReturnType<typeof setInterval> | null = null
  private isConnected = false
  private intervalMs = 2500
  private sequenceStep = 0
  private lastOrderId = 1000

  deserialize(_data: Partial<IDataStreamProvider> = {}): void {
    // Abstract Base requirement
  }

  async connect(config?: Record<string, unknown>): Promise<void> {
    if (this.isConnected) return

    if (config?.intervalMs && typeof config.intervalMs === 'number') {
      this.intervalMs = config.intervalMs
    }

    this.isConnected = true

    // 1. Emit initial Schema Snapshot
    const snapshotEvent: TStreamEvent = {
      id: `evt_snapshot_${Date.now()}`,
      type: StreamEventTypeEnum.SCHEMA_SNAPSHOT,
      timestamp: Date.now(),
      payload: {
        tables: mockSchema.tables as unknown as ITableNode[],
        edges: mockSchema.edges as unknown as IRelationEdge[]
      }
    }
    this.broadcast(snapshotEvent)

    // 2. Start automated simulation heartbeat
    this.timerId = setInterval(() => {
      this.generateNextMutation()
    }, this.intervalMs)
  }

  disconnect(): void {
    if (this.timerId) {
      clearInterval(this.timerId)
      this.timerId = null
    }
    this.isConnected = false
  }

  subscribe(handler: TEventSubscription): TUnsubscribe {
    this.subscribers.add(handler)
    return () => {
      this.subscribers.delete(handler)
    }
  }

  emitMockEvent(event: TStreamEvent): void {
    this.broadcast(event)
  }

  private broadcast(event: TStreamEvent): void {
    this.subscribers.forEach(handler => handler(event))
  }

  private generateNextMutation(): void {
    const step = this.sequenceStep % 5
    this.sequenceStep++

    let event: TStreamEvent

    switch (step) {
      case 0: {
        // Scenario A: New Order placed by user
        this.lastOrderId++
        event = {
          id: `evt_ord_ins_${Date.now()}`,
          type: StreamEventTypeEnum.ROW_MUTATED,
          timestamp: Date.now(),
          payload: {
            tableId: 'orders',
            action: MutationActionEnum.INSERT,
            row: {
              id: this.lastOrderId,
              user_id: 1,
              status: 'pending',
              total_amount: (Math.random() * 200 + 20).toFixed(2),
              created_at: new Date().toISOString()
            },
            relatedEdgeIds: ['orders.user_id->users.id']
          }
        }
        break
      }

      case 1: {
        // Scenario B: Order Items added to that order
        event = {
          id: `evt_item_ins_${Date.now()}`,
          type: StreamEventTypeEnum.ROW_MUTATED,
          timestamp: Date.now(),
          payload: {
            tableId: 'order_items',
            action: MutationActionEnum.INSERT,
            row: {
              id: Date.now() % 100000,
              order_id: this.lastOrderId,
              product_name: 'Database Observability License',
              quantity: Math.floor(Math.random() * 3) + 1,
              unit_price: '49.99'
            },
            relatedEdgeIds: ['order_items.order_id->orders.id']
          }
        }
        break
      }

      case 2: {
        // Scenario C: Order status updated to completed
        event = {
          id: `evt_ord_upd_${Date.now()}`,
          type: StreamEventTypeEnum.ROW_MUTATED,
          timestamp: Date.now(),
          payload: {
            tableId: 'orders',
            action: MutationActionEnum.UPDATE,
            row: {
              id: this.lastOrderId,
              status: 'completed'
            },
            relatedEdgeIds: ['orders.user_id->users.id']
          }
        }
        break
      }

      case 3: {
        // Scenario D: Audit log record inserted
        event = {
          id: `evt_audit_ins_${Date.now()}`,
          type: StreamEventTypeEnum.ROW_MUTATED,
          timestamp: Date.now(),
          payload: {
            tableId: 'audit_logs',
            action: MutationActionEnum.INSERT,
            row: {
              id: Date.now() % 100000,
              action: 'order.checkout.completed',
              actor_ip: '127.0.0.1',
              status_code: 200,
              created_at: new Date().toISOString()
            },
            relatedEdgeIds: []
          }
        }
        break
      }

      default: {
        // Scenario E: Old cart item removed
        event = {
          id: `evt_item_del_${Date.now()}`,
          type: StreamEventTypeEnum.ROW_MUTATED,
          timestamp: Date.now(),
          payload: {
            tableId: 'order_items',
            action: MutationActionEnum.DELETE,
            row: {
              id: Date.now() % 100000,
              order_id: this.lastOrderId
            },
            relatedEdgeIds: ['order_items.order_id->orders.id']
          }
        }
        break
      }
    }

    this.broadcast(event)
  }
}

export { MockProvider }
