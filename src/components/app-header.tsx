import { SizeEnum } from '../core/enums/size'
import { AccentEnum } from '../core/enums/accent'
import { ConnectionStatusEnum } from '../core/enums/connection-status'
import { useConnectionStore } from '../store/connection-store'
import { Badge } from './shared/badge'
import { Button } from './shared/button'
import { Icon } from './shared/icon'
import { Tile } from './shared/tile'
import { useModalsStore } from '../store/modals-store'
import { useSchemaStore } from '../store/schema-store'
import { formatNumber } from '../core/utils/number'
import { pluralForm } from '../core/utils/string'
import type { TStatusTheme } from '../core/meta/t-component'
import locale from '../locales/en.json'

const STATUS_THEMES: Record<ConnectionStatusEnum, TStatusTheme> = {
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

function LiveChangeLogModalToggle() {
  const modal = useModalsStore(state => state.modals?.['change-log-modal'])
  const toggleChangeLogModal = () => useModalsStore.getState().toggleModal('change-log-modal')

  return (
    !!modal && (
      <Button accent={AccentEnum.MUTED} className="tip tip-bottom" data-tip={locale.common.labels.liveChangeLog} active={modal.isOpen} toggle icon onClick={toggleChangeLogModal}>
        <Icon name="change-log" />
      </Button>
    )
  )
}

function StreamToggle() {
  const connectionEstablished = useConnectionStore(state => state.status == ConnectionStatusEnum.CONNECTED)
  const isPaused = useConnectionStore(state => state.isPaused)
  const togglePause = useConnectionStore(state => state.togglePause)

  return (
    connectionEstablished && (
      <Button accent={isPaused ? AccentEnum.WARNING : AccentEnum.INFO} onClick={togglePause}>
        <Icon name={isPaused ? 'play' : 'pause'} className="mr-1" />
        <span>{isPaused ? locale.common.labels.resumeStream : locale.common.labels.pauseStream}</span>
      </Button>
    )
  )
}

function SchemaBadges() {
  const tablesCount = useSchemaStore(state => state.tableIds.length)
  const edgesCount = useSchemaStore(state => state.edges.length)

  return (
    <>
      {!!tablesCount && (
        <Badge accent={AccentEnum.PRIMARY} className="shrink-0" title={formatNumber(tablesCount, 'standard')}>
          <span>{formatNumber(tablesCount)}</span>
          &nbsp;
          <span className="text-muted-300">{pluralForm(tablesCount, locale.common.labels.table)}</span>
        </Badge>
      )}
      {!!edgesCount && (
        <Badge accent={AccentEnum.PRIMARY} className="shrink-0" title={formatNumber(edgesCount, 'standard')}>
          <span>{formatNumber(edgesCount)}</span>
          &nbsp;
          <span className="text-muted-300">{pluralForm(edgesCount, locale.common.labels.relation)}</span>
        </Badge>
      )}
    </>
  )
}

function AppHeader() {
  const status = useConnectionStore(state => state.status)
  const target = useConnectionStore(state => state.target)

  const theme = STATUS_THEMES[status]
  const statusLabel = locale.common.enum.ConnectionStatusEnum[status]

  return (
    <header className="app-header">
      <div className="app-header-brand">
        <Tile accent={AccentEnum.LOGO} size={SizeEnum.LG}>
          <Icon name="logo-sm" className="text-white"></Icon>
        </Tile>
        <h1 className="mx-2">PlexoDB</h1>
        <Badge size={SizeEnum.XS} accent={AccentEnum.INFO} className="font-mono" title={__APP_VERSION__}>
          v{__APP_VERSION__}
        </Badge>
      </div>
      <div className="app-header-content">
        <div className="app-header-info">
          <Badge accent={theme.accent} className="app-header-status" title={`${statusLabel}${target ? `: ${target}` : ''}`}>
            <span className={`circle-sm mr-1.5 shrink-0 ${theme.indicatorClass}`} />
            <span className="app-header-status-text">
              <span className={`text-${theme.accent}-300`}>{statusLabel}:</span>
              &nbsp;
              {target && <span>{target}</span>}
            </span>
          </Badge>
          <SchemaBadges />
        </div>
        <div className="app-header-actions">
          <StreamToggle />
          <LiveChangeLogModalToggle />
          <Button accent={AccentEnum.MUTED} className="tip tip-bottomRight" data-tip={locale.common.labels.settings} icon>
            <Icon name="gear" />
          </Button>
        </div>
      </div>
    </header>
  )
}

export { AppHeader }
