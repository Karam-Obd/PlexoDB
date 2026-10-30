import { create } from 'zustand'
import type { TLedgerStore } from '../core/meta/t-store'
import type { TNullable } from '../core/meta/t-shared'
import type { TStreamEvent } from '../core/meta/t-event'

const MAX_EVENTS = 50

const useLedgerStore = create<TLedgerStore>(set => ({
  events: [],
  selectedTableId: null,

  pushEvent: (event: TStreamEvent) => {
    set(state => ({
      events: [event, ...state.events].slice(0, MAX_EVENTS),
    }))
  },

  setSelectedTableId: (id: TNullable<string>) => {
    set({ selectedTableId: id })
  },

  clearEvents: () => {
    set({ events: [] })
  },
}))

export { useLedgerStore }
