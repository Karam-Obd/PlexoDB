import { Modal } from './shared/modal'
import { useModalsStore } from '../store/modals-store'

function ModalLayer() {
  const modalIds = useModalsStore(state => state.modalIds)

  return (
    <>
      {modalIds.map(modalId => (
        <Modal key={modalId} id={modalId} />
      ))}
    </>
  )
}

export { ModalLayer }
