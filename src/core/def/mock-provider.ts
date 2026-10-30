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
  private lastOrderId = 1040

  deserialize(): void {
    // Abstract Base requirement
  }

  async connect(config?: Record<string, unknown>): Promise<void> {
    if (this.isConnected) return

    if (config?.intervalMs && typeof config.intervalMs === 'number') {
      this.intervalMs = config.intervalMs
    }

    this.isConnected = true

    // 1. Emit initial Schema Snapshot with database metadata
    const snapshotEvent: TStreamEvent = {
      id: `evt_snapshot_${Date.now()}`,
      type: StreamEventTypeEnum.SCHEMA_SNAPSHOT,
      timestamp: Date.now(),
      payload: {
        databaseName: 'ecommerce_db',
        latencyMs: 1.1,
        channel: 'relaydb_schema_channel',
        tables: mockSchema.tables as unknown as ITableNode[],
        edges: mockSchema.edges as unknown as IRelationEdge[]
      }
    }
    this.broadcast(snapshotEvent)

    // 2. Start automated simulation heartbeat
    this.startHeartbeat()
  }

  pause(): void {
    this.stopHeartbeat()
  }

  resume(): void {
    if (this.isConnected) {
      this.startHeartbeat()
    }
  }

  private startHeartbeat(): void {
    if (this.timerId) return
    this.timerId = setInterval(() => {
      this.generateNextMutation()
    }, this.intervalMs)
  }

  private stopHeartbeat(): void {
    if (this.timerId) {
      clearInterval(this.timerId)
      this.timerId = null
    }
  }

  disconnect(): void {
    this.stopHeartbeat()
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
    const step = this.sequenceStep % 6
    this.sequenceStep++

    let event: TStreamEvent

    switch (step) {
      case 0: {
        // Scenario A: New Order placed by customer (INSERT)
        this.lastOrderId++
        const newOrderId = this.lastOrderId
        const createdAt = new Date().toISOString()
        const total = (Math.random() * 150 + 29.99).toFixed(2)

        event = {
          id: `evt_ord_ins_${Date.now()}`,
          type: StreamEventTypeEnum.ROW_MUTATED,
          timestamp: Date.now(),
          payload: {
            tableId: 'orders',
            action: MutationActionEnum.INSERT,
            channel: 'relaydb_row_channel',
            latencyMs: 0.9,
            query: `INSERT INTO orders (id, user_id, status, total_amount, payment_method, created_at, updated_at) VALUES (${newOrderId}, 1, 'pending', ${total}, 'credit_card', NOW(), NOW());`,
            row: {
              id: newOrderId,
              user_id: 1,
              status: 'pending',
              total_amount: total,
              payment_method: 'credit_card',
              tracking_number: null,
              discount_code: null,
              created_at: createdAt,
              updated_at: createdAt
            },
            relatedEdgeIds: ['orders.user_id->users.id']
          }
        }
        break
      }

      case 1: {
        // Scenario B: Order line-item attached (INSERT)
        const itemId = Math.floor(Math.random() * 90000) + 10000
        const qty = Math.floor(Math.random() * 2) + 1

        event = {
          id: `evt_item_ins_${Date.now()}`,
          type: StreamEventTypeEnum.ROW_MUTATED,
          timestamp: Date.now(),
          payload: {
            tableId: 'order_items',
            action: MutationActionEnum.INSERT,
            channel: 'relaydb_row_channel',
            latencyMs: 0.6,
            query: `INSERT INTO order_items (id, order_id, product_name, quantity, unit_price) VALUES (${itemId}, ${this.lastOrderId}, 'RelayDB Pro License', ${qty}, 39.00);`,
            row: {
              id: itemId,
              order_id: this.lastOrderId,
              product_name: 'RelayDB Pro License',
              quantity: qty,
              unit_price: '39.00'
            },
            relatedEdgeIds: ['order_items.order_id->orders.id']
          }
        }
        break
      }

      case 2: {
        // Scenario C: Order checkout completed with 5+ fields updated
        // Tests strict 4-line cap, truncation bar (+ N more changed fields), and previousData diff
        const now = new Date().toISOString()
        const prevTime = new Date(Date.now() - 45000).toISOString()

        event = {
          id: `evt_ord_upd_${Date.now()}`,
          type: StreamEventTypeEnum.ROW_MUTATED,
          timestamp: Date.now(),
          payload: {
            tableId: 'orders',
            action: MutationActionEnum.UPDATE,
            channel: 'relaydb_row_channel',
            latencyMs: 1.2,
            query: `UPDATE orders SET status = 'completed', payment_method = 'credit_card', tracking_number = 'TRK-98214-US', discount_code = 'RELAY_VIP', total_amount = '119.99', updated_at = NOW() WHERE id = ${this.lastOrderId};`,
            previousData: {
              id: this.lastOrderId,
              user_id: 1,
              status: 'pending',
              total_amount: '149.99',
              payment_method: 'pending_selection',
              tracking_number: null,
              discount_code: null,
              created_at: prevTime,
              updated_at: prevTime
            },
            row: {
              id: this.lastOrderId,
              user_id: 1,
              status: 'completed',
              total_amount: '119.99',
              payment_method: 'credit_card',
              tracking_number: 'TRK-98214-US',
              discount_code: 'RELAY_VIP',
              created_at: prevTime,
              updated_at: now
            },
            relatedEdgeIds: ['orders.user_id->users.id']
          }
        }
        break
      }

      case 3: {
        // Scenario D: Audit log recorded for security transaction (INSERT)
        const auditId = Math.floor(Math.random() * 90000) + 10000

        event = {
          id: `evt_audit_ins_${Date.now()}`,
          type: StreamEventTypeEnum.ROW_MUTATED,
          timestamp: Date.now(),
          payload: {
            tableId: 'audit_logs',
            action: MutationActionEnum.INSERT,
            channel: 'relaydb_row_channel',
            latencyMs: 0.5,
            query: `INSERT INTO audit_logs (id, action, actor_ip, status_code, created_at) VALUES (${auditId}, 'checkout.payment_verified', '192.168.1.105', 200, NOW());`,
            row: {
              id: auditId,
              action: 'checkout.payment_verified',
              actor_ip: '192.168.1.105',
              status_code: 200,
              created_at: new Date().toISOString()
            },
            relatedEdgeIds: []
          }
        }
        break
      }

      case 4: {
        // Scenario E: Stale cart item pruned / cancelled (DELETE)
        const deleteItemId = Math.floor(Math.random() * 90000) + 10000

        event = {
          id: `evt_item_del_${Date.now()}`,
          type: StreamEventTypeEnum.ROW_MUTATED,
          timestamp: Date.now(),
          payload: {
            tableId: 'order_items',
            action: MutationActionEnum.DELETE,
            channel: 'relaydb_row_channel',
            latencyMs: 0.7,
            query: `DELETE FROM order_items WHERE id = ${deleteItemId} AND order_id = ${this.lastOrderId};`,
            previousData: {
              id: deleteItemId,
              order_id: this.lastOrderId,
              product_name: 'Promotional Trial Pack',
              quantity: 1,
              unit_price: '0.00'
            },
            row: {
              id: deleteItemId,
              order_id: this.lastOrderId
            },
            relatedEdgeIds: ['order_items.order_id->orders.id']
          }
        }
        break
      }

      default: {
        // Scenario F: DDL Schema Alteration (SCHEMA_MUTATED)
        // Tests DDL card rendering and schema morphing
        event = {
          id: `evt_ddl_${Date.now()}`,
          type: StreamEventTypeEnum.SCHEMA_MUTATED,
          timestamp: Date.now(),
          payload: {
            diffDescription: 'ALTER TABLE orders ADD COLUMN IF NOT EXISTS notes text',
            query: 'ALTER TABLE orders ADD COLUMN notes TEXT DEFAULT \'\';',
            channel: 'relaydb_schema_channel',
            latencyMs: 2.1,
            tables: mockSchema.tables as unknown as ITableNode[],
            edges: mockSchema.edges as unknown as IRelationEdge[]
          }
        }
        break
      }
    }

    this.broadcast(event)
  }
}

export { MockProvider }
