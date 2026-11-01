import { Icon } from './shared/icon'
import { Badge } from './shared/badge'
import { Anchor } from './shared/anchor'
import { SizeEnum } from '../core/enums/size'
import { AccentEnum } from '../core/enums/accent'
import { pluralForm } from '../core/utils/string'
import { formatNumber } from '../core/utils/number'
import { StreamEventTypeEnum } from '../core/enums/stream-event-type'
import { useConnectionStore } from '../store/connection-store'
import type { TChangLogCardProps } from '../core/meta/t-component'
import type { TStreamEvent } from '../core/meta/t-event'
import locale from '../locales/en.json'

type TSnapshotEvent = Extract<TStreamEvent, { type: StreamEventTypeEnum.SCHEMA_SNAPSHOT }>

interface TSnapShotCardProps {
  event: TSnapshotEvent
}

function SnapShotCard({ event }: TSnapShotCardProps) {
  const target = event.payload.databaseName ?? '-'
  const tablesCount = event.payload.tables.length
  const edgesCount = event.payload.edges.length
  const latency = event.payload.latencyMs ?? '-'

  return (
    <div className="change-log-card">
      <div className="change-log-card-header">
        <div className="flex items-center min-w-0 mr-2">
          <Badge accent={AccentEnum.SECONDARY} size={SizeEnum.SM} className="shrink-0">
            {locale.common.labels.snapshot}
          </Badge>
          <span className="font-mono ml-2 truncate" title={target}>
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
          <span className="font-mono text-muted-300">{`${latency}ms ${locale.common.labels.latency}`}</span>
        </div>
        <Anchor className="flex items-center font-mono">
          <span>{locale.common.labels.viewDetails}</span>
          <Icon name="link-open" className="ml-1" />
        </Anchor>
      </div>
    </div>
  )
}

function ChangeLogCard({ event }: TChangLogCardProps) {
  switch (event.type) {
    case StreamEventTypeEnum.SCHEMA_SNAPSHOT:
      return <SnapShotCard event={event} />
    default:
      return null
  }
}

export { ChangeLogCard }
