import { Button } from './button'
import { Icon } from './icon'
import { useModalsStore } from '../../store/modals-store'
import { AccentEnum } from '../../core/enums/accent'

function Modal({ id }: { id: string }) {
  const modal = useModalsStore(state => state.modals[id])

  if (!modal || !modal.isOpen) return null

  return (
    <>
      {!modal.noBackDrop && <div className="modal-backdrop" onClick={() => useModalsStore.getState().toggleModal(id)}></div>}
      <div className={`modal modal-${modal.size} ${modal.fill ? `fill-${modal.size}` : ''} ${modal.isDrawer ? `drawer drawer-${modal.drawerDir}` : ''}`} id={id}>
        <div className="modal-header">
          {modal.header}
          {!modal.noCloseButton && (
            <Button accent={AccentEnum.PRIMARY} icon onClick={() => useModalsStore.getState().toggleModal(id)}>
              <Icon name="xmark" />
            </Button>
          )}
        </div>
        <div className="modal-body">{modal.body}</div>
      </div>
    </>
  )
}

export { Modal }
