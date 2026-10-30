import { useEffect, useState } from 'react'
import { AccentEnum } from '../core/enums/accent'
import { KeyTypeEnum } from '../core/enums/key-type'
import { MutationActionEnum } from '../core/enums/mutation-action'
import { SizeEnum } from '../core/enums/size'
import { useDraggable } from '../core/hooks/use-draggable'
import type { TMutationTheme, TTableCardProps } from '../core/meta/t-component'
import { formatNumber } from '../core/utils/number'
import { pluralForm } from '../core/utils/string'
import { useSchemaStore } from '../store/schema-store'
import { Badge } from './shared/badge'
import locale from '../locales/en.json'

const MUTATION_THEMES: Record<MutationActionEnum, TMutationTheme> = {
  [MutationActionEnum.INSERT]: {
    cardClass: 'table-card-active-insert',
    badgeAccent: AccentEnum.INFO,
    indicatorClass: 'bg-info-300'
  },
  [MutationActionEnum.UPDATE]: {
    cardClass: 'table-card-active-update',
    badgeAccent: AccentEnum.WARNING,
    indicatorClass: 'bg-warning-300'
  },
  [MutationActionEnum.DELETE]: {
    cardClass: 'table-card-active-delete',
    badgeAccent: AccentEnum.DANGER,
    indicatorClass: 'bg-danger-300'
  }
}

const DEFAULT_THEME: TMutationTheme = {
  cardClass: '',
  badgeAccent: AccentEnum.MUTED,
  indicatorClass: 'bg-success-300'
}

function TableCard({ tableId }: TTableCardProps) {
  const table = useSchemaStore(state => state.tables[tableId])
  const [prevActivityAt, setPrevActivityAt] = useState(table?.lastActivityAt)
  const [activeAction, setActiveAction] = useState<MutationActionEnum | null>(null)

  if (table && table.lastActivityAt !== prevActivityAt) {
    setPrevActivityAt(table.lastActivityAt)
    setActiveAction(table.lastAction ?? null)
  }

  useEffect(() => {
    if (activeAction === null) return
    const timer = setTimeout(() => {
      setActiveAction(null)
    }, 800)
    return () => clearTimeout(timer)
  }, [activeAction])

  const dragHandlers = useDraggable({
    scaleAware: true,
    stopPropagation: true,
    onDrag: (dx, dy) => {
      const current = useSchemaStore.getState().tables[tableId]?.position ?? { x: 0, y: 0 }
      useSchemaStore.getState().updateTablePosition(tableId, current.x + dx, current.y + dy)
    }
  })

  if (!table) return null

  const activeTheme = activeAction !== null ? MUTATION_THEMES[activeAction] : DEFAULT_THEME

  return (
    <div
      className={`table-card ${activeTheme.cardClass}`}
      data-canvas-node="true"
      style={{
        transform: `translate3d(${table.position.x}px, ${table.position.y}px, 0)`
      }}
    >
      <header className="table-card-header" {...dragHandlers}>
        <h3 title={table.name ?? ''}>{table.name}</h3>

        <Badge accent={activeTheme.badgeAccent}>
          <span className={`circle-sm mr-1 ${activeTheme.indicatorClass}`}></span>
          <span title={`${formatNumber(table.rowCount, 'standard')}`}>
            {formatNumber(table.rowCount)} {pluralForm(table.rowCount, locale.common.labels.row)}
          </span>
        </Badge>
      </header>

      <div className="p-2 pt-0">
        <table className="table table-muted table-rounded-sm">
          <tbody>
            {table.columns.map((column, index) => (
              <tr key={index}>
                <td width="10%">
                  {column.keyType !== KeyTypeEnum.NONE && (
                    <Badge
                      accent={column.keyType === KeyTypeEnum.PRIMARY ? AccentEnum.INFO : AccentEnum.WARNING}
                      size={SizeEnum.SM}
                      className="inline-block"
                      title={locale.common.enum.KeyTypeEnum[column.keyType].label}
                    >
                      {locale.common.enum.KeyTypeEnum[column.keyType].short}
                    </Badge>
                  )}
                </td>
                <td width="65%">{column.name}</td>
                <td width="25%" className="font-mono text-right text-muted-300">
                  {locale.common.enum.DataTypeEnum[column.dataType]}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export { TableCard }
