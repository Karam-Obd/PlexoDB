import { create } from 'zustand'
import { Modal } from '../core/def/modal'
import type { IModal } from '../core/meta/i-modal'

type TModalsStore = {
  modalIds: string[]
  modals: Record<string, IModal>
  registerModal: (id: string, modal: IModal) => void
  unregisterModal: (id: string) => void
  toggleModal: (id: string) => void
  toggleFill: (id: string) => void
}

const useModalsStore = create<TModalsStore>(set => ({
  modalIds: [] as string[],
  modals: {} as Record<string, IModal>,

  registerModal(id: string, modal: IModal) {
    set(state => ({
      modalIds: state.modalIds.includes(id) ? state.modalIds : [...state.modalIds, id],
      modals: { ...state.modals, [id]: modal }
    }))
  },

  unregisterModal(id: string) {
    set(state => {
      const nextModals = { ...state.modals }
      delete nextModals[id]
      return { modalIds: state.modalIds.filter(modalId => modalId !== id), modals: nextModals }
    })
  },

  toggleModal(id: string) {
    set(state => {
      const modal = state.modals[id]
      if (!modal) return state
      return {
        modals: { ...state.modals, [id]: new Modal({ ...modal, isOpen: !modal.isOpen }) }
      }
    })
  },

  toggleFill(id: string) {
    set(state => {
      const modal = state.modals[id]
      if (!modal) return state
      return {
        modals: { ...state.modals, [id]: new Modal({ ...modal, fill: !modal.fill }) }
      }
    })
  }
}))

export { useModalsStore }
