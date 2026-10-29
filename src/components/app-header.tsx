import { AccentEnum } from '../core/enums/accent'
import { ConnectionStatusEnum } from '../core/enums/connection-status'
import { useConnectionStore } from '../store/connection-store'
import { Badge } from './shared/badge'
import { SizeEnum } from '../core/enums/size'
import { Button } from './shared/button'
import { Icon } from './shared/icon'
import locale from '../locales/en.json'

const STATUS_THEMES: Record<ConnectionStatusEnum, { accent: AccentEnum; indicatorClass: string }> = {
  [ConnectionStatusEnum.CONNECTED]: {
    accent: AccentEnum.SUCCESS,
    indicatorClass: 'bg-success-300'
  },
  [ConnectionStatusEnum.CONNECTING]: {
    accent: AccentEnum.MUTED,
    indicatorClass: 'bg-muted-300'
  },
  [ConnectionStatusEnum.DISCONNECTED]: {
    accent: AccentEnum.DANGER,
    indicatorClass: 'bg-danger-300'
  }
}

function AppHeader() {
  const status = useConnectionStore(state => state.status)
  const target = useConnectionStore(state => state.target)

  const theme = STATUS_THEMES[status]
  const statusLabel = locale.common.enum.ConnectionStatusEnum[status]

  return (
    <header className="app-header">
      <div className="app-header-brand">
        <h1>RelayDB</h1>
      </div>
      <div className="app-header-content">
        <Badge accent={theme.accent} size={SizeEnum.LG} className="app-header-status" title={`${statusLabel}${target ? `: ${target}` : ''}`}>
          <span className={`circle-sm mr-1.5 shrink-0 ${theme.indicatorClass}`} />
          <span className="app-header-status-text">
            {statusLabel}
            {target && <span>: {target}</span>}
          </span>
        </Badge>
        <div className="app-header-actions">
          <Button accent={AccentEnum.PRIMARY} className="tip tip-bottomRight" data-tip={locale.common.labels.settings} icon>
            <Icon name="gear" />
          </Button>
        </div>
      </div>
    </header>
  )
}

export { AppHeader }
