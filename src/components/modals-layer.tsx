import { Modal } from './shared/modal'
import { useModalsStore } from '../store/modals-store'

function ModalLayer() {
  const modalIds = useModalsStore(state => state.modalIds)

  return (
    <div id="modals-layer">
      {modalIds.map(modalId => (
        <div id={modalId}>
          <Modal key={modalId} id={modalId} />
        </div>
      ))}
    </div>
  )
}

export { ModalLayer }
