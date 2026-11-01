import { Badge } from './shared/badge'
import { Button } from './shared/button'
import { Icon } from './shared/icon'
import { ChangeLogCard } from './change-log-card'
import { formatNumber } from '../core/utils/number'
import { pluralForm } from '../core/utils/string'
import { useLedgerStore } from '../store/ledger-store'
import { AccentEnum } from '../core/enums/accent'
import { ButtonVariantEnum } from '../core/enums/button-variant'
import locale from '../locales/en.json'

export function ChangeLogModalHeader() {
  const eventsCount = useLedgerStore(state => state.events.length)

  const clearSteam = () => useLedgerStore.getState().clearEvents()

  return (
    <>
      <div className="flex grow">
        <h2 className="mr-2">{locale.common.labels.liveChangeLog}</h2>
        <Badge accent={AccentEnum.PRIMARY} title={formatNumber(eventsCount, 'standard')}>
          <span>{formatNumber(eventsCount)}</span>
          &nbsp;
          <span className="text-muted-300">{pluralForm(eventsCount, locale.common.labels.event)}</span>
        </Badge>
      </div>
      {!!eventsCount && (
        <Button accent={AccentEnum.MUTED} variant={ButtonVariantEnum.GHOST} className="tip tip-bottom mx-2" data-tip={locale.common.labels.clearChangeLog} icon onClick={clearSteam}>
          <Icon name="trash" />
        </Button>
      )}
    </>
  )
}

export function ChangeLogModalBody() {
  const events = useLedgerStore(state => state.events)

  if (!events.length)
    return (
      <div className="empty">
        <div className="flex flex-col items-center text-center px-6">
          <Icon name="empty-box" className="text-muted-100" />
          <h4 className="mt-4 text-primary-300">{locale.common.labels.noEventsTitle}</h4>
          <p className="w-75 mt-1.5 text-muted-300 text-xs">{locale.common.labels.noEventsDescription}</p>
        </div>
      </div>
    )

  return (
    <>
      {events.map(event => (
        <ChangeLogCard key={event.id} event={event} />
      ))}
    </>
  )
}
