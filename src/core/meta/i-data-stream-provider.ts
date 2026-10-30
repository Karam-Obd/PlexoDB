import type { TEventSubscription, TStreamEvent, TUnsubscribe } from './t-event'

interface IDataStreamProvider {
  connect(config?: Record<string, unknown>): Promise<void>
  disconnect(): void
  subscribe(handler: TEventSubscription): TUnsubscribe
  emitMockEvent?(event: TStreamEvent): void
  pause?(): void
  resume?(): void
}

export type { IDataStreamProvider }
