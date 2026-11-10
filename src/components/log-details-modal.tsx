import { Badge } from './shared/badge'
import { Button } from './shared/button'
import { Icon } from './shared/icon'
import { SizeEnum } from '../core/enums/size'
import { AccentEnum } from '../core/enums/accent'
import { StreamEventTypeEnum } from '../core/enums/stream-event-type'
import { MutationActionEnumAccentMap } from '../core/enums/mutation-action'
import { SchemaActionEnum, SchemaActionEnumAccentMap } from '../core/enums/schema-action'
import { formatTime } from '../core/utils/date'
import { messageFormat } from '../core/utils/string'
import { isNum } from '../core/utils/number'
import { useSchemaStore } from '../store/schema-store'
import { useCanvasStore } from '../store/canvas-store'
import { useModalsStore } from '../store/modals-store'
import type { TLogDetailsModalProps } from '../core/meta/t-component'
import locale from '../locales/en.json'

function LogDetailsModalHeader({ event }: TLogDetailsModalProps) {
  if (!event) return null

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
        const rawId = event.payload.row?.id ?? event.payload.previousData?.id
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
    <div className="mr-2">
      <div className="flex items-center">
        {actionBadge}
        {title}
      </div>
      <div className="text-muted-300 mt-1">
        <span>{locale.common.labels.timestamp}: </span>
        <span>{formatTime(event.timestamp)}</span>
      </div>
    </div>
  )
}

function LogDetailsModalBody({ event }: TLogDetailsModalProps) {
  if (!event) return null

  const latency = isNum(event.payload.latencyMs) ? messageFormat(event.payload.latencyMs, locale.common.labels.ms) : '-'

  return (
    <div className="grid grid-cols-2 gap-2 p-4 border-bottom-primary-100">
      <div>
        <span className="block text-muted-300 uppercase tracking-wider text-xs">{locale.common.labels.eventId}</span>
        <span className="block truncate" title={event.id}>
          {event.id}
        </span>
      </div>
      <div>
        <span className="block text-muted-300 uppercase tracking-wider text-xs">{locale.common.labels.propagationLatency}</span>
        <span className="block text-success-300">{latency}</span>
      </div>
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
