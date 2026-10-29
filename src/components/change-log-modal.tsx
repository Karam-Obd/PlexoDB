import { AccentEnum } from '../core/enums/accent'
import { Button } from './shared/button'
import { Icon } from './shared/icon'
import { useModalsStore } from '../store/modals-store'
import locale from '../locales/en.json'

export function ChangeLogModalHeader() {
  const isFill = useModalsStore(state => state.modals['change-log-modal']?.fill ?? false)

  const toggleDrawer = () => {
    useModalsStore.getState().toggleFill('change-log-modal')
  }

  return (
    <>
      {isFill && <h1>{locale.common.labels.liveChangeLog}</h1>}
      <Button accent={AccentEnum.PRIMARY} className="tip tip-bottomRight ml-auto" data-tip={locale.common.labels.toggleLiveChangeLog} icon toggle active={isFill} onClick={toggleDrawer}>
        <Icon name="sidebar" />
      </Button>
    </>
  )
}

export function ChangeLogModalBody() {
  const isFill = useModalsStore(state => state.modals['change-log-modal']?.fill ?? false)

  if (!isFill) return <></>

  return (
    <>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
      <h1>change log body</h1>
    </>
  )
}
