import { Icon } from './shared/icon'
import { Badge } from './shared/badge'
import { Button } from './shared/button'
import { Anchor } from './shared/anchor'
import { SizeEnum } from '../core/enums/size'
import { AccentEnum } from '../core/enums/accent'
import { pluralForm } from '../core/utils/string'
import { formatNumber } from '../core/utils/number'
import { formatTime } from '../core/utils/date'
import { MutationActionEnum } from '../core/enums/mutation-action'
import { StreamEventTypeEnum } from '../core/enums/stream-event-type'
import type { TRowMutatedEvent } from '../core/meta/t-event'
import type { TChangLogCardProps, TSnapShotCardProps, TRowMutatedCardProps } from '../core/meta/t-component'
import locale from '../locales/en.json'

const rowMutationBadgeAccentMap = {
  [MutationActionEnum.INSERT]: AccentEnum.INFO,
  [MutationActionEnum.UPDATE]: AccentEnum.WARNING,
  [MutationActionEnum.DELETE]: AccentEnum.DANGER
}

const getRelationLabel = (event: TRowMutatedEvent) => {
  const edgeId = event.payload.relatedEdgeIds?.[0]
  return edgeId ? edgeId.replace('->', ' → ') : null
}

function SnapShotCard({ event, className }: TSnapShotCardProps) {
  const target = event.payload.databaseName ?? '-'
  const tablesCount = event.payload.tables.length
  const edgesCount = event.payload.edges.length
  const latency = event.payload.latencyMs ?? '-'

  return (
    <div className={`change-log-card ${className}`}>
      <div className="change-log-card-header">
        <div className="flex items-center min-w-0 mr-2">
          <Badge accent={AccentEnum.SECONDARY} size={SizeEnum.SM} className="shrink-0">
            {locale.common.labels.snapshot}
          </Badge>
          <span className="font-mono font-bold ml-2 truncate" title={target}>
            {target}
          </span>
        </div>
        <small className="text-muted-300 shrink-0">{locale.common.labels.boot}</small>
      </div>

      <div className="change-log-card-body">
        <div>
          <span className="circle-xs bg-success-300 mr-1.5 shrink-0"></span>
          <span className="text-success-300">{locale.common.labels.initialGraphIntrospected}</span>
        </div>
        <p className="font-mono text-muted-300 mt-1 pl-3">
          <span>
            {formatNumber(tablesCount)} {pluralForm(tablesCount, locale.common.labels.table)}
          </span>
          <span className="mx-1.5">•</span>
          <span>
            {formatNumber(edgesCount)} {pluralForm(edgesCount, locale.common.labels.relation)}
          </span>
          <span className="ml-1.5">{locale.common.labels.synchronized}</span>
        </p>
      </div>

      <div className="change-log-card-footer">
        <div>
          <span className="circle-xs bg-info-300 mr-1.5 shrink-0"></span>
          <span className="text-muted-300">{`${latency}ms ${locale.common.labels.latency}`}</span>
        </div>
        <Anchor className="flex items-center">
          <span>{locale.common.labels.viewDetails}</span>
          <Icon name="link-open" className="ml-1" />
        </Anchor>
      </div>
    </div>
  )
}

function RowMutatedCard({ event, className }: TRowMutatedCardProps) {
  const rowId = (() => {
    const rawId = event.payload.row?.id ?? event.payload.previousData?.id
    if (rawId === null || rawId === undefined) return null
    return `#${String(rawId)}`
  })()

  const footerText = event.payload.action === MutationActionEnum.DELETE ? locale.common.labels.oneRowPermanentlyRemoved : getRelationLabel(event)

  return (
    <div className={`change-log-card ${className}`}>
      <div className="change-log-card-header">
        <div className="flex items-center min-w-0 mr-2">
          <Badge accent={rowMutationBadgeAccentMap[event.payload.action]} size={SizeEnum.SM} className="shrink-0">
            {locale.common.enum.MutationActionEnum[event.payload.action]}
          </Badge>
          <span className="font-bold ml-2 truncate" title={event.payload.tableId}>
            {event.payload.tableId}
          </span>
          {rowId && <small className="ml-2 text-muted-300 shrink-0">{rowId}</small>}
        </div>
        <div className="flex items-center shrink-0">
          <small className="text-muted-300">{formatTime(event.timestamp)}</small>
          <Button size={SizeEnum.XS} accent={AccentEnum.SECONDARY} className="ml-2">
            <Icon name="center" className="text-info-300" width={12} height={12} />
            <span className="ml-1">{locale.common.labels.focus}</span>
          </Button>
        </div>
      </div>
      <div className="change-log-card-footer">
        {footerText && (
          <div className="min-w-0 truncate mr-2">
            <span className={`circle-xs bg-${rowMutationBadgeAccentMap[event.payload.action]}-300 mr-1.5 shrink-0`}></span>
            <span className="font-mono text-muted-300 truncate" title={footerText}>
              {footerText}
            </span>
          </div>
        )}
        <Anchor className="flex items-center ml-auto shrink-0">
          <span>{locale.common.labels.viewDetails}</span>
          <Icon name="link-open" className="ml-1" />
        </Anchor>
      </div>
    </div>
  )
}

function ChangeLogCard({ event, className }: TChangLogCardProps) {
  switch (event.type) {
    case StreamEventTypeEnum.SCHEMA_SNAPSHOT:
      return <SnapShotCard event={event} className={className} />
    case StreamEventTypeEnum.ROW_MUTATED:
      return <RowMutatedCard event={event} className={className} />
    default:
      return null
  }
}

export { ChangeLogCard }
