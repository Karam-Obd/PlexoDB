import { useState } from 'react'
import { Accent } from '../core/enums/accent'
import { useDraggable } from '../core/hooks/use-draggable'
import { formatNumber } from '../core/utils/number'
import { pluralForm } from '../core/utils/string'
import { Badge } from './shared/badge'

function TableCard() {
  const [position, setPosition] = useState({ x: 80, y: 80 })

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
        <h3 title="users">users</h3>

        <Badge accent={Accent.MUTED}>
          <span className="circle-sm bg-success-300 mr-1"></span>
          <span title={`${formatNumber(2241, 'standard')}`}>
            {formatNumber(2241)} {pluralForm(2214, 'row')}
          </span>
        </Badge>
      </header>
      <div className="p-2 pt-0">
        <table className="table table-muted table-rounded-sm">
          <tbody>
            <tr className="connection-node connection-right">
              <td width="10%">
                <Badge accent={Accent.INFO} className="inline-block" title="Primary Key">
                  PK
                </Badge>
              </td>
              <td width="65%">id</td>
              <td width="25%" className="font-mono text-right text-muted-300">
                uuid
              </td>
            </tr>
            <tr>
              <td></td>
              <td>name</td>
              <td className="font-mono text-right text-muted-300">varchar</td>
            </tr>
            <tr>
              <td></td>
              <td>email</td>
              <td className="font-mono text-right text-muted-300">varchar</td>
            </tr>
            <tr className="connection-node connection-right">
              <td>
                <Badge accent={Accent.WARNING} className="inline-block" title="Foreign Key">
                  FK
                </Badge>
              </td>
              <td>role_id</td>
              <td className="font-mono text-right text-muted-300">uuid</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

export { TableCard }
