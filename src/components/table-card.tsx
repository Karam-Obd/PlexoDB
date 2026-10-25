import { useState } from 'react'
import { Accent } from '../core/enums/accent'
import { KeyType } from '../core/enums/key-type'
import { useDraggable } from '../core/hooks/use-draggable'
import { formatNumber } from '../core/utils/number'
import { pluralForm } from '../core/utils/string'
import { useSchemaStore } from '../store/schema-store'
import { Badge } from './shared/badge'
import locale from '../locales/en.json'

type TTableCardProps = {
  tableId: string
}

function TableCard({ tableId }: TTableCardProps) {
  const table = useSchemaStore(state => state.tables[tableId])
  const [position, setPosition] = useState(() => table.position)

  const dragHandlers = useDraggable({
    scaleAware: true,
    stopPropagation: true,
    onDrag: (dx, dy) => {
      setPosition(pos => ({
        x: pos.x + dx,
        y: pos.y + dy
      }))
    }
  })

  return (
    <div
      className="table-card"
      data-canvas-node="true"
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`
      }}
    >
      <header className="flex items-center justify-between px-2 py-1.5 cursor-grab active:cursor-grabbing select-none" {...dragHandlers}>
        <h3 title={table.name}>{table.name}</h3>

        <Badge accent={Accent.MUTED}>
          <span className="circle-sm bg-success-300 mr-1"></span>
          <span title={`${formatNumber(table.rowCount, 'standard')}`}>
            {formatNumber(table.rowCount)} {pluralForm(table.rowCount, locale.common.labels.row)}
          </span>
        </Badge>
      </header>

      <div className="p-2 pt-0">
        <table className="table table-muted table-rounded-sm">
          <tbody>
            {table.columns.map((column, index) => (
              <tr key={index} className={`connection-node ${column.keyType != KeyType.NONE ? 'connection-right' : ''}`}>
                <td width="10%">
                  {column.keyType !== KeyType.NONE && (
                    <Badge accent={column.keyType === KeyType.PRIMARY ? Accent.INFO : Accent.WARNING} className="inline-block" title={locale.common.enum.keyType[column.keyType].label}>
                      {locale.common.enum.keyType[column.keyType].short}
                    </Badge>
                  )}
                </td>
                <td width="65%">{column.name}</td>
                <td width="25%" className="font-mono text-right text-muted-300">
                  {locale.common.enum.dataType[column.dataType]}
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
