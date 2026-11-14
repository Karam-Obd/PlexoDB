import { useState, useRef, useEffect } from 'react'
import { Badge } from './shared/badge'
import { Button } from './shared/button'
import { Anchor } from './shared/anchor'
import { Card } from './shared/card'
import { Icon } from './shared/icon'
import { ObjectDiff } from './object-diff'
import { SizeEnum } from '../core/enums/size'
import { AccentEnum } from '../core/enums/accent'
import { ButtonVariantEnum } from '../core/enums/button-variant'
import { StreamEventTypeEnum } from '../core/enums/stream-event-type'
import { MutationActionEnum, MutationActionEnumAccentMap } from '../core/enums/mutation-action'
import { SchemaActionEnum, SchemaActionEnumAccentMap } from '../core/enums/schema-action'
import { DataTypeEnum } from '../core/enums/data-type'
import { KeyTypeEnum } from '../core/enums/key-type'
import { formatTime } from '../core/utils/date'
import { messageFormat, pluralFormat } from '../core/utils/string'
import { isNum, formatNumber } from '../core/utils/number'
import { useSchemaStore } from '../store/schema-store'
import { useCanvasStore } from '../store/canvas-store'
import { useModalsStore } from '../store/modals-store'
import { useLogDetailsModalStore } from '../store/log-details-modal-store'
import type { TLogDetailsModalProps } from '../core/meta/t-component'
import type { TStreamEvent, TRowMutatedEvent, TSchemaMutatedEvent, TSchemaSnapshotEvent } from '../core/meta/t-event'
import type { TNullable } from '../core/meta/t-shared'
import locale from '../locales/en.json'

const getColumnLabel = (dataType: DataTypeEnum, keyType?: KeyTypeEnum) => {
  const typeStr = locale.common.enum.DataTypeEnum[dataType]
  const keyStr = keyType === KeyTypeEnum.PRIMARY ? ' (PK)' : keyType === KeyTypeEnum.FOREIGN ? ' (FK)' : ''
  return `${typeStr}${keyStr}`
}

const getEventQuery = (event?: TNullable<TStreamEvent>): string => {
  if (!event) return ''
  if ('query' in event.payload && typeof event.payload.query === 'string') {
    return event.payload.query
  }
  return ''
}

function RowMutatedChanges({ event }: { event: TRowMutatedEvent }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-muted-300 mb-3">
        <span className="font-semibold uppercase tracking-wider">{locale.common.labels.completeLineByLineChanges}</span>
        <span className="font-mono text-xs">{locale.common.labels.diffLegend}</span>
      </div>
      <Card className="bg-canvas" bodyClassName="p-0">
        <ObjectDiff cur={event.payload.row} prev={event.payload.previousData} />
      </Card>
    </div>
  )
}

function AlterTableChanges({ event }: { event: TSchemaMutatedEvent }) {
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

  return (
    <div>
      <div className="flex items-center justify-between text-xs text-muted-300 mb-3">
        <span className="font-semibold uppercase tracking-wider">{locale.common.labels.completeLineByLineChanges}</span>
        <span className="font-mono text-xs">{locale.common.labels.diffLegend}</span>
      </div>
      <Card className="bg-canvas" bodyClassName="p-0">
        <ObjectDiff cur={Object.keys(cur).length > 0 ? cur : null} prev={Object.keys(prev).length > 0 ? prev : null} />
      </Card>
    </div>
  )
}

function CreateTableChanges({ event }: { event: TSchemaMutatedEvent }) {
  const columns = event.payload.alteredColumns ?? []

  return (
    <div>
      <div className="flex items-center justify-between text-xs text-muted-300 mb-3">
        <span className="font-semibold uppercase tracking-wider">
          {locale.common.enum.SchemaActionEnum[event.payload.action]}: {event.payload.targetTableId}
        </span>
        <span className="font-mono text-xs">
          {formatNumber(columns.length)} {pluralFormat(columns.length, locale.common.labels.column)}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {columns.map(col => (
          <Card key={col.name} className="bg-canvas" bodyClassName="flex items-center justify-between">
            <span className="font-semibold truncate mr-2" title={col.name ?? '-'}>
              {col.name}
            </span>
            <span
              className={`font-mono shrink-0 ${
                col.keyType === KeyTypeEnum.PRIMARY ? 'text-info-300 font-semibold' : col.keyType === KeyTypeEnum.FOREIGN ? 'text-warning-300 font-semibold' : 'text-muted-300'
              }`}
            >
              {locale.common.enum.DataTypeEnum[col.dataType]}
              &nbsp;
              {col.keyType === KeyTypeEnum.PRIMARY ? 'PK' : col.keyType === KeyTypeEnum.FOREIGN ? 'FK' : ''}
            </span>
          </Card>
        ))}
      </div>
    </div>
  )
}

function DropTableChanges({ event }: { event: TSchemaMutatedEvent }) {
  const columnsCount = event.payload.alteredColumns?.length ?? 0

  return (
    <Card className="bg-canvas" bodyClassName="p-4">
      <div className="flex items-center text-danger-300 font-semibold">
        <Icon name="trash" className="text-danger-300 shrink-0" width={14} height={14} />
        <span className="ml-2">{locale.common.labels.tablePurgedPermanently}</span>
      </div>
      <p className="text-muted-300 mt-2 ml-6 text-xs">
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
    </Card>
  )
}

function SnapshotChanges({ event }: { event: TSchemaSnapshotEvent }) {
  const tablesCount = event.payload.tables.length
  const edgesCount = event.payload.edges.length

  return (
    <Card className="bg-canvas" bodyClassName="p-4">
      <div className="flex items-center text-success-300 font-semibold">
        <span className="circle-xs bg-success-300 mr-2 shrink-0"></span>
        <span>{locale.common.labels.initialGraphIntrospected}</span>
      </div>
      <p className="text-muted-300 mt-2 ml-4 text-xs">
        <span>
          {formatNumber(tablesCount)} {pluralFormat(tablesCount, locale.common.labels.table)}
        </span>
        <span className="mx-1.5">•</span>
        <span>
          {formatNumber(edgesCount)} {pluralFormat(edgesCount, locale.common.labels.relation)}
        </span>
        <span className="ml-1.5">{locale.common.labels.synchronized}</span>
      </p>
    </Card>
  )
}

function ChangesTabContent({ event }: { event: TStreamEvent }) {
  switch (event.type) {
    case StreamEventTypeEnum.ROW_MUTATED:
      return <RowMutatedChanges event={event} />
    case StreamEventTypeEnum.SCHEMA_MUTATED:
      switch (event.payload.action) {
        case SchemaActionEnum.ALTER_TABLE:
          return <AlterTableChanges event={event} />
        case SchemaActionEnum.CREATE_TABLE:
          return <CreateTableChanges event={event} />
        case SchemaActionEnum.DROP_TABLE:
          return <DropTableChanges event={event} />
        default:
          return null
      }
    case StreamEventTypeEnum.SCHEMA_SNAPSHOT:
      return <SnapshotChanges event={event} />
    default:
      return null
  }
}

function LogDetailsModalHeader({ event }: TLogDetailsModalProps) {
  const activeTab = useLogDetailsModalStore(state => state.activeTab)
  const setActiveTab = useLogDetailsModalStore(state => state.setActiveTab)
  const [copied, setCopied] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  if (!event) return null

  const sqlQuery = getEventQuery(event)
  const hasSql = Boolean(sqlQuery)

  const handleCopy = () => {
    if (copied) return
    const textToCopy = activeTab === 'sql' ? sqlQuery : JSON.stringify(activeTab === 'payload' ? event : event.payload, null, 2)
    navigator.clipboard?.writeText(textToCopy).catch(() => {})
    setCopied(true)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setCopied(false), 1500)
  }

  const handleClose = () => useModalsStore.getState().toggleModal('log-details-modal')
  const latency = isNum(event.payload.latencyMs) ? messageFormat(event.payload.latencyMs, locale.common.labels.ms) : '-'

  const actionBadge = (() => {
    switch (event.type) {
      case StreamEventTypeEnum.ROW_MUTATED:
        return (
          <Badge accent={MutationActionEnumAccentMap[event.payload.action]} size={SizeEnum.SM} className="shrink-0 mr-3">
            {locale.common.enum.MutationActionEnum[event.payload.action]}
          </Badge>
        )
      case StreamEventTypeEnum.SCHEMA_MUTATED:
        return (
          <Badge accent={SchemaActionEnumAccentMap[event.payload.action]} size={SizeEnum.SM} className="shrink-0 mr-3">
            {locale.common.enum.SchemaActionEnum[event.payload.action]}
          </Badge>
        )
      case StreamEventTypeEnum.SCHEMA_SNAPSHOT:
        return (
          <Badge accent={AccentEnum.SECONDARY} size={SizeEnum.SM} className="shrink-0 mr-3">
            {locale.common.labels.snapshot}
          </Badge>
        )
      default:
        return null
    }
  })()

  const title = (() => {
    switch (event.type) {
      case StreamEventTypeEnum.ROW_MUTATED: {
        const rawId = event.payload.row?.['id'] ?? event.payload.previousData?.['id']
        const rowId = rawId !== null && rawId !== undefined ? `#${String(rawId)}` : null
        return (
          <>
            <h2 className="truncate m-0">{event.payload.tableId}</h2>
            {rowId && <span className="text-muted-300 text-sm ml-2">{rowId}</span>}
          </>
        )
      }
      case StreamEventTypeEnum.SCHEMA_MUTATED:
        return (
          <h2 className={`truncate m-0 ${event.payload.action === SchemaActionEnum.DROP_TABLE ? 'line-through text-muted-300' : ''}`} title={event.payload.targetTableId}>
            {event.payload.targetTableId}
          </h2>
        )
      case StreamEventTypeEnum.SCHEMA_SNAPSHOT:
        return (
          <h2 className="truncate m-0" title={event.payload.databaseName ?? '-'}>
            {event.payload.databaseName ?? '-'}
          </h2>
        )
      default:
        return null
    }
  })()

  return (
    <div className="w-full">
      <div className="flex items-center justify-between p-4">
        <div className="min-w-0 mr-2">
          <div className="flex items-center">
            {actionBadge}
            {title}
          </div>
          <div className="text-muted-300 mt-1">
            <span>{locale.common.labels.timestamp}: </span>
            <span>{formatTime(event.timestamp)}</span>
          </div>
        </div>
        <Button accent={AccentEnum.SECONDARY} variant={ButtonVariantEnum.GHOST} icon onClick={handleClose}>
          <Icon name="xmark" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2 px-4 py-2.5 border-top-primary-100 border-bottom-primary-100 bg-surface-300">
        <div className="min-w-0">
          <span className="block text-muted-300 uppercase tracking-wider text-xs">{locale.common.labels.eventId}</span>
          <span className="block truncate" title={event.id}>
            {event.id}
          </span>
        </div>
        <div className="min-w-0">
          <span className="block text-muted-300 uppercase tracking-wider text-xs">{locale.common.labels.propagationLatency}</span>
          <span className="block text-success-300">{latency}</span>
        </div>
      </div>

      <div className="nav">
        <ul>
          <li className={activeTab === 'changes' ? 'active' : ''} onClick={() => setActiveTab('changes')}>
            <Icon name="code-compare" />
            <span>{locale.common.labels.changes}</span>
          </li>
          <li className={activeTab === 'payload' ? 'active' : ''} onClick={() => setActiveTab('payload')}>
            <Icon name="html" />
            <span>{locale.common.labels.payload}</span>
          </li>
          <li className={`${activeTab === 'sql' ? 'active' : ''} ${!hasSql ? 'disabled' : ''}`.trim()} onClick={() => hasSql && setActiveTab('sql')}>
            <Icon name="database" />
            <span>{locale.common.labels.sql}</span>
          </li>
        </ul>
        <div>
          <Anchor className="flex items-center text-xs" disabled={copied} onClick={handleCopy}>
            <Icon name="copy" className="mr-1" />
            <span>{copied ? locale.common.labels.copied : locale.common.labels.copy}</span>
          </Anchor>
        </div>
      </div>
    </div>
  )
}

function LogDetailsModalBody({ event }: TLogDetailsModalProps) {
  const activeTab = useLogDetailsModalStore(state => state.activeTab)

  if (!event) return null

  const sqlQuery = getEventQuery(event)

  return (
    <div className="p-4">
      {activeTab === 'changes' && <ChangesTabContent event={event} />}
      {activeTab === 'payload' && (
        <div>
          <div className="flex items-center justify-between text-xs text-muted-300 mb-3">
            <span className="font-semibold uppercase tracking-wider">{locale.common.labels.rawStreamEventJson}</span>
            <span className="font-mono text-xs">{locale.common.labels.applicationJson}</span>
          </div>
          <Card className="bg-canvas" bodyClassName="p-3">
            <pre className="m-0 overflow-x-auto text-xs leading-relaxed font-mono">{JSON.stringify(event, null, 2)}</pre>
          </Card>
        </div>
      )}
      {activeTab === 'sql' && (
        <div>
          <div className="flex items-center justify-between text-xs text-muted-300 mb-3">
            <span className="font-semibold uppercase tracking-wider">{locale.common.labels.executedPostgreSqlQuery}</span>
            <span className="font-mono text-xs">{locale.common.labels.sql}</span>
          </div>
          <Card className="bg-canvas" bodyClassName="p-3">
            <pre className="m-0 overflow-x-auto text-xs leading-relaxed font-mono">{sqlQuery}</pre>
          </Card>
        </div>
      )}
    </div>
  )
}

function LogDetailsModalFooter({ event }: TLogDetailsModalProps) {
  const tableId = (() => {
    if (!event) return null
    if (event.type === StreamEventTypeEnum.ROW_MUTATED) return event.payload.tableId
    if (event.type === StreamEventTypeEnum.SCHEMA_MUTATED) {
      if (event.payload.action === SchemaActionEnum.DROP_TABLE) return null
      return event.payload.targetTableId ?? null
    }
    return null
  })()

  const handleClose = () => useModalsStore.getState().toggleModal('log-details-modal')

  const handleFocus = () => {
    if (!tableId) return
    const table = useSchemaStore.getState().tables?.[tableId]
    if (table) {
      useCanvasStore.getState().focusTable(table)
      handleClose()
    }
  }

  return (
    <div className="flex items-center justify-between w-full">
      {tableId && (
        <Button accent={AccentEnum.SECONDARY} onClick={handleFocus}>
          <Icon name="center" className="text-info-300" width={14} height={14} />
          <span className="ml-1.5">{locale.common.labels.focusTable}</span>
        </Button>
      )}

      <Button accent={AccentEnum.SECONDARY} className="ml-auto" onClick={handleClose}>
        {locale.common.labels.close}
      </Button>
    </div>
  )
}

export { LogDetailsModalHeader, LogDetailsModalBody, LogDetailsModalFooter }
