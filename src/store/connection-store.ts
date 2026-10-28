import { create } from 'zustand'
import { ConnectionStatusEnum } from '../core/enums/connection-status'

type TConnectionStore = {
  status: ConnectionStatusEnum
  target: string
  setStatus: (status: ConnectionStatusEnum, target?: string) => void
  setConnected: (target: string) => void
  setDisconnected: () => void
}

const useConnectionStore = create<TConnectionStore>(set => ({
  status: ConnectionStatusEnum.DISCONNECTED,
  target: '',

  setStatus: (status, target) =>
    set(state => ({
      status,
      target: target ?? state.target
    })),

  setConnected: target =>
    set({
      status: ConnectionStatusEnum.CONNECTED,
      target
    }),

  setDisconnected: () =>
    set({
      status: ConnectionStatusEnum.DISCONNECTED
    })
}))

export { useConnectionStore }
