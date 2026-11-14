import { create } from 'zustand'
import type { TLogDetailsModalStore, TLogDetailsTab } from '../core/meta/t-store'

const useLogDetailsModalStore = create<TLogDetailsModalStore>(set => ({
  activeTab: 'changes',
  setActiveTab: (tab: TLogDetailsTab) => set({ activeTab: tab }),
  reset: () => set({ activeTab: 'changes' })
}))

export { useLogDetailsModalStore }
