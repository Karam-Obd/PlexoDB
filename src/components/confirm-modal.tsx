import { Button } from './shared/button'
import { AccentEnum } from '../core/enums/accent'
import { ButtonVariantEnum } from '../core/enums/button-variant'
import { useModalsStore } from '../store/modals-store'
import type { TConfirmModalHeaderProps, TConfirmModalBodyProps } from '../core/meta/t-component'
import locale from '../locales/en.json'

function ConfirmModalHeader({ label }: TConfirmModalHeaderProps) {
  return <h3>{label}</h3>
}

function ConfirmModalBody({ id, buttonProps, description, actionLabel }: TConfirmModalBodyProps) {
  const closeModal = () => useModalsStore.getState().toggleModal(id)

  return (
    <>
      {description && <p className="text-muted-300 mb-4">{description}</p>}
      <div className="flex gap-3 justify-end">
        <Button className="min-w-20" accent={AccentEnum.MUTED} variant={ButtonVariantEnum.GHOST} onClick={closeModal}>
          {locale.common.labels.cancel}
        </Button>
        <Button {...buttonProps} className={`min-w-20${buttonProps?.className ? ` ${buttonProps.className}` : ''}`}>
          {actionLabel}
        </Button>
      </div>
    </>
  )
}

export { ConfirmModalHeader, ConfirmModalBody }
