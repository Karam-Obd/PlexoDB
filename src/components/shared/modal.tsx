import { Button } from './button'
import { Icon } from './icon'
import { useModalsStore } from '../../store/modals-store'
import { AccentEnum } from '../../core/enums/accent'
import { ButtonVariantEnum } from '../../core/enums/button-variant'
import type { TModalProps } from '../../core/meta/t-component'

function Modal({ id }: TModalProps) {
  const modal = useModalsStore(state => state.modals[id])

  if (!modal || !modal.isOpen) return null

  return (
    <>
      {!modal.noBackDrop && <div className="modal-backdrop" onClick={() => useModalsStore.getState().toggleModal(id)}></div>}
      <div className={`modal modal-${modal.size} ${modal.fill ? `fill-${modal.size}` : ''} ${modal.isDrawer ? `drawer drawer-${modal.drawerDir}` : ''}`} id={id}>
        <div className={`modal-header ${modal.headerClassName ?? ''}`.trim()}>
          {modal.header}
          {!modal.noCloseButton && (
            <Button accent={AccentEnum.SECONDARY} variant={ButtonVariantEnum.GHOST} className="ml-auto" icon onClick={() => useModalsStore.getState().toggleModal(id)}>
              <Icon name="xmark" />
            </Button>
          )}
        </div>
        <div className={`modal-body ${modal.bodyClassName ?? ''}`.trim()}>{modal.body}</div>
        {modal.footer && <div className={`modal-footer ${modal.footerClassName ?? ''}`.trim()}>{modal.footer}</div>}
      </div>
    </>
  )
}

export { Modal }
