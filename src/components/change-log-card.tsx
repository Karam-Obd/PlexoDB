import { memo } from 'react'
import { Icon } from './shared/icon'
import { Badge } from './shared/badge'
import { Button } from './shared/button'
import { Anchor } from './shared/anchor'
import { ObjectDiff } from './object-diff'
import { SizeEnum } from '../core/enums/size'
import { AccentEnum } from '../core/enums/accent'
import { pluralFormat } from '../core/utils/string'
import { formatNumber } from '../core/utils/number'
import { formatTime } from '../core/utils/date'
import { StreamEventTypeEnum } from '../core/enums/stream-event-type'
import { MutationActionEnum, MutationActionEnumAccentMap } from '../core/enums/mutation-action'
import { SchemaActionEnum, SchemaActionEnumAccentMap } from '../core/enums/schema-action'
import { KeyTypeEnum } from '../core/enums/key-type'
import type { DataTypeEnum } from '../core/enums/data-type'
import type { TRowMutatedEvent, TSchemaMutatedEvent } from '../core/meta/t-event'
import type { TChangLogCardProps, TSnapShotCardProps, TRowMutatedCardProps, TSchemaMutatedCardProps } from '../core/meta/t-component'
import locale from '../locales/en.json'

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
        <div className="flex items-center text-danger-300 font-semibold">
          <span className="circle-xs bg-success-300 mr-1.5 shrink-0"></span>
          <span className="text-success-300">{locale.common.labels.initialGraphIntrospected}</span>
        </div>
        <p className="text-muted-300 mt-1 ml-3.5">
          <span>
            {formatNumber(tablesCount)} {pluralFormat(tablesCount, locale.common.labels.table)}
          </span>
          <span className="mx-1.5">•</span>
          <span>
            {formatNumber(edgesCount)} {pluralFormat(edgesCount, locale.common.labels.relation)}
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
          <Badge accent={MutationActionEnumAccentMap[event.payload.action]} size={SizeEnum.SM} className="shrink-0">
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
      <ObjectDiff cur={event.payload.row} prev={event.payload.previousData} limit={3} prioritizeChanges truncate />
      <div className="change-log-card-footer">
        {footerText && (
          <div className="min-w-0 truncate mr-2">
            <span className={`circle-xs bg-${MutationActionEnumAccentMap[event.payload.action]}-300 mr-1.5 shrink-0`}></span>
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

const getColumnLabel = (dataType: DataTypeEnum, keyType?: KeyTypeEnum) => {
  const typeStr = locale.common.enum.DataTypeEnum[dataType]
  const keyStr = keyType === KeyTypeEnum.PRIMARY ? ' (PK)' : keyType === KeyTypeEnum.FOREIGN ? ' (FK)' : ''
  return `${typeStr}${keyStr}`
}

function AlterTableCardBody({ event }: { event: TSchemaMutatedEvent }) {
  const cur: Record<string, unknown> = {}
  const prev: Record<string, unknown> = {}

  event.payload.alteredColumns?.forEach(col => {
    const label = getColumnLabel(col.dataType, col.keyType)

    if (col.action === MutationActionEnum.INSERT) {
      cur[col.name] = label
    } else if (col.action === MutationActionEnum.DELETE) {
      prev[col.name] = label
    } else if (col.action === MutationActionEnum.UPDATE) {
      prev[col.name] = col.previousDataType !== undefined ? getColumnLabel(col.previousDataType, col.keyType) : label
      cur[col.name] = label
    }
  })

  return <ObjectDiff cur={Object.keys(cur).length > 0 ? cur : null} prev={Object.keys(prev).length > 0 ? prev : null} limit={3} prioritizeChanges truncate />
}

function DropTableCardBody({ event }: { event: TSchemaMutatedEvent }) {
  const columnsCount = event.payload.alteredColumns?.length ?? 0

  return (
    <div className="change-log-card-body">
      <div className="flex items-center text-danger-300 font-semibold">
        <Icon name="trash" className="text-danger-300 shrink-0" width={14} height={14} />
        <span className="ml-2">{locale.common.labels.tablePurgedPermanently}</span>
      </div>
      <p className="text-muted-300 mt-1 ml-6">
        <span>{locale.common.labels.cascadeExecuted}</span>
        {columnsCount > 0 && (
          <>
            <span className="mx-1.5">•</span>
            <span>
              {formatNumber(columnsCount)} {pluralFormat(columnsCount, locale.common.labels.column)}
            </span>
          </>
        )}
        <span className="ml-1.5">{locale.common.labels.dependentConstraintsDropped}</span>
      </p>
    </div>
  )
}

function SchemaMutationCardBody({ event }: { event: TSchemaMutatedEvent }) {
  switch (event.payload.action) {
    case SchemaActionEnum.ALTER_TABLE:
      return <AlterTableCardBody event={event} />
    case SchemaActionEnum.CREATE_TABLE:
      return
    case SchemaActionEnum.DROP_TABLE:
      return <DropTableCardBody event={event} />
    default:
      return null
  }
}

function SchemaMutationCard({ event, className }: TSchemaMutatedCardProps) {
  return (
    <div className={`change-log-card ${className}`}>
      <div className="change-log-card-header">
        <div className="flex items-center min-w-0 mr-2">
          <Badge accent={SchemaActionEnumAccentMap[event.payload.action]} size={SizeEnum.SM} className="shrink-0">
            {locale.common.enum.SchemaActionEnum[event.payload.action]}
          </Badge>
          <span className={`font-bold ml-2 truncate ${event.payload.action === SchemaActionEnum.DROP_TABLE ? 'line-through text-muted-300' : ''}`} title={event.payload.targetTableId}>
            {event.payload.targetTableId}
          </span>
        </div>
        <div className="flex items-center shrink-0">
          <small className="text-muted-300">{formatTime(event.timestamp)}</small>
          {event.payload.action !== SchemaActionEnum.DROP_TABLE && (
            <Button size={SizeEnum.XS} accent={AccentEnum.SECONDARY} className="ml-2">
              <Icon name="center" className="text-info-300" width={12} height={12} />
              <span className="ml-1">{locale.common.labels.focus}</span>
            </Button>
          )}
        </div>
      </div>

      <SchemaMutationCardBody event={event} />

      <div className="change-log-card-footer">
        <Anchor className="flex items-center ml-auto shrink-0">
          <span>{locale.common.labels.viewDetails}</span>
          <Icon name="link-open" className="ml-1" />
        </Anchor>
      </div>
    </div>
  )
}

const ChangeLogCard = memo(function ChangeLogCard({ event, className }: TChangLogCardProps) {
  switch (event.type) {
    case StreamEventTypeEnum.SCHEMA_SNAPSHOT:
      return <SnapShotCard event={event} className={className} />
    case StreamEventTypeEnum.ROW_MUTATED:
      return <RowMutatedCard event={event} className={className} />
    case StreamEventTypeEnum.SCHEMA_MUTATED:
      return <SchemaMutationCard event={event} className={className} />
    default:
      return null
  }
})

export { ChangeLogCard }
