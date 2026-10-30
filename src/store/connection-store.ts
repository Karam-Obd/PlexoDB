import { create } from 'zustand'
import { ConnectionStatusEnum } from '../core/enums/connection-status'
import type { TConnectionStore } from '../core/meta/t-store'

const useConnectionStore = create<TConnectionStore>(set => ({
  status: ConnectionStatusEnum.DISCONNECTED,
  target: '',
  isPaused: false,
  provider: null,

  setStatus: (status, target) =>
    set(state => ({
      status,
      target: target ?? state.target
    })),

  setConnected: (target, provider) =>
    set({
      status: ConnectionStatusEnum.CONNECTED,
      target,
      provider: provider ?? null,
      isPaused: false
    }),

  setDisconnected: () =>
    set({
      status: ConnectionStatusEnum.DISCONNECTED,
      provider: null,
      isPaused: false
    }),

  setProvider: provider =>
    set({
      provider
    }),

  togglePause: () =>
    set(state => {
      const next = !state.isPaused
      if (next) {
        state.provider?.pause?.()
      } else {
        state.provider?.resume?.()
      }
      return { isPaused: next }
    })
}))

export { useConnectionStore }
