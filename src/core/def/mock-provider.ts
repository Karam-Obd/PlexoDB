import { Base } from './base'
import { MutationActionEnum } from '../enums/mutation-action'
import { SchemaActionEnum } from '../enums/schema-action'
import { StreamEventTypeEnum } from '../enums/stream-event-type'
import { DataTypeEnum } from '../enums/data-type'
import { KeyTypeEnum } from '../enums/key-type'
import { CardinalityEnum } from '../enums/cardinality'
import { SchemaEnum } from '../enums/schema'
import type { IDataStreamProvider } from '../meta/i-data-stream-provider'
import type { IRelationEdge } from '../meta/i-relation-edge'
import type { ITableNode } from '../meta/i-table-node'
import type { IColumn } from '../meta/i-column'
import type { TEventSubscription, TStreamEvent, TUnsubscribe } from '../meta/t-event'
import mockSchema from '../mock/mock-schema.json'

class MockProvider extends Base<IDataStreamProvider> implements IDataStreamProvider {
  private subscribers: Set<TEventSubscription> = new Set()
  private timerId: ReturnType<typeof setInterval> | null = null
  private isConnected = false
  private intervalMs = 2500
  private sequenceStep = 0
  private lastOrderId = 1040
  private lastReviewId = 0
  private currentTables: ITableNode[] = []
  private currentEdges: IRelationEdge[] = []

  deserialize(): void {
    // Abstract Base requirement
  }

  private cloneInitialSchema(): { tables: ITableNode[]; edges: IRelationEdge[] } {
    return {
      tables: JSON.parse(JSON.stringify(mockSchema.tables)) as ITableNode[],
      edges: JSON.parse(JSON.stringify(mockSchema.edges)) as IRelationEdge[]
    }
  }

  async connect(config?: Record<string, unknown>): Promise<void> {
    if (this.isConnected) return

    if (config?.intervalMs && typeof config.intervalMs === 'number') {
      this.intervalMs = config.intervalMs
    }

    this.isConnected = true

    const { tables, edges } = this.cloneInitialSchema()
    this.currentTables = tables
    this.currentEdges = edges

    // 1. Emit initial Schema Snapshot with database metadata
    const snapshotEvent: TStreamEvent = {
      id: 'evt_snapshot_initial',
      type: StreamEventTypeEnum.SCHEMA_SNAPSHOT,
      timestamp: Date.now(),
      payload: {
        databaseName: 'ecommerce_db',
        latencyMs: 1.1,
        channel: 'plexodb_schema_channel',
        tables: JSON.parse(JSON.stringify(this.currentTables)),
        edges: JSON.parse(JSON.stringify(this.currentEdges))
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

  // --- DDL Mock Event Generators ---

  /**
   * Mock Event: ALTER TABLE orders ADD COLUMN notes TEXT;
   */
  public emitAlterTableAddColumn(): TStreamEvent {
    const orders = this.currentTables.find(t => t.id === 'orders')
    if (orders && !orders.columns.some(c => c.name === 'notes')) {
      const notesColumn: IColumn = {
        id: 'orders.notes',
        name: 'notes',
        dataType: DataTypeEnum.TEXT,
        keyType: KeyTypeEnum.NONE,
        isNullable: true,
        defaultValue: null,
        foreignKeyTarget: undefined
      }
      orders.columns.push(notesColumn)
    }

    const event: TStreamEvent = {
      id: `evt_ddl_add_col_${Date.now()}`,
      type: StreamEventTypeEnum.SCHEMA_MUTATED,
      timestamp: Date.now(),
      payload: {
        action: SchemaActionEnum.ALTER_TABLE,
        targetTableId: 'orders',
        diffDescription: 'ALTER TABLE orders ADD COLUMN notes text',
        query: 'ALTER TABLE orders ADD COLUMN notes TEXT DEFAULT NULL;',
        channel: 'plexodb_schema_channel',
        latencyMs: 1.8,
        tables: JSON.parse(JSON.stringify(this.currentTables)),
        edges: JSON.parse(JSON.stringify(this.currentEdges))
      }
    }
    this.broadcast(event)
    return event
  }

  /**
   * Mock Event: CREATE TABLE reviews (...)
   */
  public emitCreateTable(): TStreamEvent {
    if (!this.currentTables.some(t => t.id === 'reviews')) {
      const reviewsTable: ITableNode = {
        id: 'reviews',
        name: 'reviews',
        schema: SchemaEnum.PUBLIC,
        rowCount: 8,
        position: { x: 840, y: 360 },
        lastAction: undefined,
        lastActivityAt: undefined,
        columns: [
          {
            id: 'reviews.id',
            name: 'id',
            dataType: DataTypeEnum.INTEGER,
            keyType: KeyTypeEnum.PRIMARY,
            isNullable: false,
            defaultValue: null,
            foreignKeyTarget: undefined
          },
          {
            id: 'reviews.order_id',
            name: 'order_id',
            dataType: DataTypeEnum.INTEGER,
            keyType: KeyTypeEnum.FOREIGN,
            isNullable: false,
            defaultValue: null,
            foreignKeyTarget: { table: 'orders', field: 'id' }
          },
          {
            id: 'reviews.rating',
            name: 'rating',
            dataType: DataTypeEnum.INTEGER,
            keyType: KeyTypeEnum.NONE,
            isNullable: false,
            defaultValue: null,
            foreignKeyTarget: undefined
          },
          {
            id: 'reviews.comment',
            name: 'comment',
            dataType: DataTypeEnum.TEXT,
            keyType: KeyTypeEnum.NONE,
            isNullable: true,
            defaultValue: null,
            foreignKeyTarget: undefined
          },
          {
            id: 'reviews.created_at',
            name: 'created_at',
            dataType: DataTypeEnum.TIMESTAMP,
            keyType: KeyTypeEnum.NONE,
            isNullable: false,
            defaultValue: 'now()',
            foreignKeyTarget: undefined
          }
        ]
      }
      this.currentTables.push(reviewsTable)

      const reviewsEdge: IRelationEdge = {
        id: 'reviews.order_id->orders.id',
        sourceTableId: 'reviews',
        sourceFieldName: 'order_id',
        targetTableId: 'orders',
        targetFieldName: 'id',
        cardinality: CardinalityEnum.ONE_TO_MANY,
        lastPulseAt: undefined
      }
      if (!this.currentEdges.some(e => e.id === reviewsEdge.id)) {
        this.currentEdges.push(reviewsEdge)
      }
    }

    const event: TStreamEvent = {
      id: `evt_ddl_create_tbl_${Date.now()}`,
      type: StreamEventTypeEnum.SCHEMA_MUTATED,
      timestamp: Date.now(),
      payload: {
        action: SchemaActionEnum.CREATE_TABLE,
        targetTableId: 'reviews',
        diffDescription: 'CREATE TABLE reviews (5 columns, 1 foreign key)',
        query: `CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);`,
        channel: 'plexodb_schema_channel',
        latencyMs: 3.4,
        tables: JSON.parse(JSON.stringify(this.currentTables)),
        edges: JSON.parse(JSON.stringify(this.currentEdges))
      }
    }
    this.broadcast(event)
    return event
  }

  /**
   * Mock Event: ALTER TABLE users ADD COLUMN phone VARCHAR(20);
   */
  public emitAlterTableAddUserPhone(): TStreamEvent {
    const users = this.currentTables.find(t => t.id === 'users')
    if (users && !users.columns.some(c => c.name === 'phone')) {
      const phoneColumn: IColumn = {
        id: 'users.phone',
        name: 'phone',
        dataType: DataTypeEnum.VARCHAR,
        keyType: KeyTypeEnum.NONE,
        isNullable: true,
        defaultValue: null,
        foreignKeyTarget: undefined
      }
      users.columns.push(phoneColumn)
    }

    const event: TStreamEvent = {
      id: `evt_ddl_user_phone_${Date.now()}`,
      type: StreamEventTypeEnum.SCHEMA_MUTATED,
      timestamp: Date.now(),
      payload: {
        action: SchemaActionEnum.ALTER_TABLE,
        targetTableId: 'users',
        diffDescription: 'ALTER TABLE users ADD COLUMN phone varchar(20)',
        query: 'ALTER TABLE users ADD COLUMN phone VARCHAR(20) DEFAULT NULL;',
        channel: 'plexodb_schema_channel',
        latencyMs: 1.5,
        tables: JSON.parse(JSON.stringify(this.currentTables)),
        edges: JSON.parse(JSON.stringify(this.currentEdges))
      }
    }
    this.broadcast(event)
    return event
  }

  /**
   * Mock Event: DROP TABLE reviews CASCADE;
   */
  public emitDropTable(): TStreamEvent {
    this.currentTables = this.currentTables.filter(t => t.id !== 'reviews')
    this.currentEdges = this.currentEdges.filter(e => e.sourceTableId !== 'reviews' && e.targetTableId !== 'reviews')

    const event: TStreamEvent = {
      id: `evt_ddl_drop_tbl_${Date.now()}`,
      type: StreamEventTypeEnum.SCHEMA_MUTATED,
      timestamp: Date.now(),
      payload: {
        action: SchemaActionEnum.DROP_TABLE,
        targetTableId: 'reviews',
        diffDescription: 'DROP TABLE reviews CASCADE (1 foreign key removed)',
        query: 'DROP TABLE reviews CASCADE;',
        channel: 'plexodb_schema_channel',
        latencyMs: 2.1,
        tables: JSON.parse(JSON.stringify(this.currentTables)),
        edges: JSON.parse(JSON.stringify(this.currentEdges))
      }
    }
    this.broadcast(event)
    return event
  }

  /**
   * Mock Event: ALTER TABLE orders DROP COLUMN notes;
   */
  public emitAlterTableDropColumn(): TStreamEvent {
    const orders = this.currentTables.find(t => t.id === 'orders')
    if (orders) {
      orders.columns = orders.columns.filter(c => c.name !== 'notes')
    }

    const event: TStreamEvent = {
      id: `evt_ddl_drop_col_${Date.now()}`,
      type: StreamEventTypeEnum.SCHEMA_MUTATED,
      timestamp: Date.now(),
      payload: {
        action: SchemaActionEnum.ALTER_TABLE,
        targetTableId: 'orders',
        diffDescription: 'ALTER TABLE orders DROP COLUMN notes',
        query: 'ALTER TABLE orders DROP COLUMN notes;',
        channel: 'plexodb_schema_channel',
        latencyMs: 1.4,
        tables: JSON.parse(JSON.stringify(this.currentTables)),
        edges: JSON.parse(JSON.stringify(this.currentEdges))
      }
    }
    this.broadcast(event)
    return event
  }

  /**
   * Mock Event: ALTER TABLE users DROP COLUMN phone;
   */
  public emitAlterTableDropUserPhone(): TStreamEvent {
    const users = this.currentTables.find(t => t.id === 'users')
    if (users) {
      users.columns = users.columns.filter(c => c.name !== 'phone')
    }

    const event: TStreamEvent = {
      id: `evt_ddl_drop_user_phone_${Date.now()}`,
      type: StreamEventTypeEnum.SCHEMA_MUTATED,
      timestamp: Date.now(),
      payload: {
        action: SchemaActionEnum.ALTER_TABLE,
        targetTableId: 'users',
        diffDescription: 'ALTER TABLE users DROP COLUMN phone',
        query: 'ALTER TABLE users DROP COLUMN phone;',
        channel: 'plexodb_schema_channel',
        latencyMs: 1.3,
        tables: JSON.parse(JSON.stringify(this.currentTables)),
        edges: JSON.parse(JSON.stringify(this.currentEdges))
      }
    }
    this.broadcast(event)
    return event
  }

  private generateNextMutation(): void {
    const step = this.sequenceStep % 12
    this.sequenceStep++

    let event: TStreamEvent

    switch (step) {
      case 0: {
        // Scenario 1: New Order placed by customer (INSERT)
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
            channel: 'plexodb_row_channel',
            latencyMs: 0.9,
            query: `INSERT INTO orders (id, user_id, status, total_amount, payment_method, created_at, updated_at) VALUES (${newOrderId}, 1, 'pending', ${total}, 'credit_card', NOW(), NOW());`,
            previousData: null,
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
        // Scenario 2: Order line-item attached (INSERT)
        const itemId = Math.floor(Math.random() * 90000) + 10000
        const qty = Math.floor(Math.random() * 2) + 1

        event = {
          id: `evt_item_ins_${Date.now()}`,
          type: StreamEventTypeEnum.ROW_MUTATED,
          timestamp: Date.now(),
          payload: {
            tableId: 'order_items',
            action: MutationActionEnum.INSERT,
            channel: 'plexodb_row_channel',
            latencyMs: 0.6,
            query: `INSERT INTO order_items (id, order_id, product_name, quantity, unit_price) VALUES (${itemId}, ${this.lastOrderId}, 'PlexoDB Pro License', ${qty}, 39.00);`,
            previousData: null,
            row: {
              id: itemId,
              order_id: this.lastOrderId,
              product_name: 'PlexoDB Pro License',
              quantity: qty,
              unit_price: '39.00'
            },
            relatedEdgeIds: ['order_items.order_id->orders.id']
          }
        }
        break
      }

      case 2: {
        // Scenario 3: DDL — ALTER TABLE orders ADD COLUMN notes TEXT (Altering Table)
        this.emitAlterTableAddColumn()
        return
      }

      case 3: {
        // Scenario 4: Order updated with 5+ fields including the new notes column (UPDATE)
        const now = new Date().toISOString()
        const prevTime = new Date(Date.now() - 45000).toISOString()

        event = {
          id: `evt_ord_upd_${Date.now()}`,
          type: StreamEventTypeEnum.ROW_MUTATED,
          timestamp: Date.now(),
          payload: {
            tableId: 'orders',
            action: MutationActionEnum.UPDATE,
            channel: 'plexodb_row_channel',
            latencyMs: 1.2,
            query: `UPDATE orders SET status = 'completed', payment_method = 'credit_card', tracking_number = 'TRK-98214-US', discount_code = 'RELAY_VIP', notes = 'Please leave package at the front porch', total_amount = '119.99', updated_at = NOW() WHERE id = ${this.lastOrderId};`,
            previousData: {
              id: this.lastOrderId,
              user_id: 1,
              status: 'pending',
              total_amount: '149.99',
              payment_method: 'pending_selection',
              tracking_number: null,
              discount_code: null,
              notes: null,
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
              notes: 'Please leave package at the front porch',
              created_at: prevTime,
              updated_at: now
            },
            relatedEdgeIds: ['orders.user_id->users.id']
          }
        }
        break
      }

      case 4: {
        // Scenario 5: DDL — CREATE TABLE reviews (...) (Adding Table)
        this.emitCreateTable()
        return
      }

      case 5: {
        // Scenario 6: Customer writes review for the completed order (INSERT into newly created table)
        this.lastReviewId++
        const reviewId = this.lastReviewId

        event = {
          id: `evt_rev_ins_${Date.now()}`,
          type: StreamEventTypeEnum.ROW_MUTATED,
          timestamp: Date.now(),
          payload: {
            tableId: 'reviews',
            action: MutationActionEnum.INSERT,
            channel: 'plexodb_row_channel',
            latencyMs: 0.8,
            query: `INSERT INTO reviews (id, order_id, rating, comment, created_at) VALUES (${reviewId}, ${this.lastOrderId}, 5, 'Exceptional experience, real-time tracking was seamless!', NOW());`,
            previousData: null,
            row: {
              id: reviewId,
              order_id: this.lastOrderId,
              rating: 5,
              comment: 'Exceptional experience, real-time tracking was seamless!',
              created_at: new Date().toISOString()
            },
            relatedEdgeIds: ['reviews.order_id->orders.id']
          }
        }
        break
      }

      case 6: {
        // Scenario 7: Audit log recorded for security transaction (INSERT)
        const auditId = Math.floor(Math.random() * 90000) + 10000

        event = {
          id: `evt_audit_ins_${Date.now()}`,
          type: StreamEventTypeEnum.ROW_MUTATED,
          timestamp: Date.now(),
          payload: {
            tableId: 'audit_logs',
            action: MutationActionEnum.INSERT,
            channel: 'plexodb_row_channel',
            latencyMs: 0.5,
            query: `INSERT INTO audit_logs (id, action, actor_ip, status_code, created_at) VALUES (${auditId}, 'checkout.payment_verified', '192.168.1.105', 200, NOW());`,
            previousData: null,
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

      case 7: {
        // Scenario 8: DDL — ALTER TABLE users ADD COLUMN phone VARCHAR(20) (Altering Table)
        this.emitAlterTableAddUserPhone()
        return
      }

      case 8: {
        // Scenario 9: Stale cart item pruned / cancelled (DELETE)
        const deleteItemId = Math.floor(Math.random() * 90000) + 10000

        event = {
          id: `evt_item_del_${Date.now()}`,
          type: StreamEventTypeEnum.ROW_MUTATED,
          timestamp: Date.now(),
          payload: {
            tableId: 'order_items',
            action: MutationActionEnum.DELETE,
            channel: 'plexodb_row_channel',
            latencyMs: 0.7,
            query: `DELETE FROM order_items WHERE id = ${deleteItemId} AND order_id = ${this.lastOrderId};`,
            previousData: {
              id: deleteItemId,
              order_id: this.lastOrderId,
              product_name: 'Promotional Trial Pack',
              quantity: 1,
              unit_price: '0.00'
            },
            row: null,
            relatedEdgeIds: ['order_items.order_id->orders.id']
          }
        }
        break
      }

      case 9: {
        // Scenario 10: DDL — DROP TABLE reviews CASCADE (Deleting Table)
        this.emitDropTable()
        return
      }

      case 10: {
        // Scenario 11: DDL — ALTER TABLE orders DROP COLUMN notes (Altering Table)
        this.emitAlterTableDropColumn()
        return
      }

      default: {
        // Scenario 12: DDL — ALTER TABLE users DROP COLUMN phone (Altering Table)
        this.emitAlterTableDropUserPhone()
        return
      }
    }

    this.broadcast(event)
  }
}

export { MockProvider }
