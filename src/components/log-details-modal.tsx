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
import { KeyTypeEnum } from '../core/enums/key-type'
import { formatTime } from '../core/utils/date'
import { messageFormat } from '../core/utils/string'
import { isNum } from '../core/utils/number'
import { useSchemaStore } from '../store/schema-store'
import { useCanvasStore } from '../store/canvas-store'
import { useModalsStore } from '../store/modals-store'
import { useLogDetailsModalStore } from '../store/log-details-modal-store'
import type { TLogDetailsModalProps } from '../core/meta/t-component'
import type { TStreamEvent } from '../core/meta/t-event'
import type { TNullable } from '../core/meta/t-shared'
import locale from '../locales/en.json'

const getEventQuery = (event?: TNullable<TStreamEvent>): string => {
  if (!event) return ''
  if ('query' in event.payload && typeof event.payload.query === 'string') {
    return event.payload.query
  }
  return ''
}

const getEventDiffData = (event?: TNullable<TStreamEvent>): { cur: TNullable<Record<string, unknown>>; prev: TNullable<Record<string, unknown>> } => {
  if (!event) return { cur: null, prev: null }

  if (event.type === StreamEventTypeEnum.ROW_MUTATED) {
    return {
      cur: event.payload.row,
      prev: event.payload.previousData ?? null
    }
  }

  if (event.type === StreamEventTypeEnum.SCHEMA_MUTATED) {
    const cur: Record<string, unknown> = {}
    const prev: Record<string, unknown> = {}

    event.payload.alteredColumns?.forEach(col => {
      const typeStr = locale.common.enum.DataTypeEnum[col.dataType] ?? String(col.dataType)
      const keyStr = col.keyType === KeyTypeEnum.PRIMARY ? ' (PK)' : col.keyType === KeyTypeEnum.FOREIGN ? ' (FK)' : ''
      const label = `${typeStr}${keyStr}`

      if (col.action === MutationActionEnum.INSERT) {
        cur[col.name] = label
      } else if (col.action === MutationActionEnum.DELETE) {
        prev[col.name] = label
      } else if (col.action === MutationActionEnum.UPDATE) {
        const prevTypeStr = col.previousDataType !== undefined ? (locale.common.enum.DataTypeEnum[col.previousDataType] ?? String(col.previousDataType)) : typeStr
        prev[col.name] = `${prevTypeStr}${keyStr}`
        cur[col.name] = label
      }
    })

    return {
      cur: Object.keys(cur).length > 0 ? cur : null,
      prev: Object.keys(prev).length > 0 ? prev : null
    }
  }

  return { cur: null, prev: null }
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
          <li className={`${activeTab === 'sql' ? 'active' : ''} ${!sqlQuery ? 'disabled' : ''}`.trim()} onClick={() => !!sqlQuery && setActiveTab('sql')}>
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
  const diffData = getEventDiffData(event)
  const hasDiff = Boolean(diffData.cur || diffData.prev)

  return (
    <div className="p-4">
      {activeTab === 'changes' && (
        <div>
          <div className="flex items-center justify-between text-xs text-muted-300 mb-3">
            <span className="font-semibold uppercase tracking-wider">{locale.common.labels.completeLineByLineChanges}</span>
            <span className="font-mono text-xs">{locale.common.labels.diffLegend}</span>
          </div>
          <Card className="bg-canvas" bodyClassName="p-0">
            {hasDiff ? <ObjectDiff cur={diffData.cur} prev={diffData.prev} /> : <div className="p-6 text-center text-muted-300 text-xs">{locale.common.labels.noChangesDetected}</div>}
          </Card>
        </div>
      )}
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
