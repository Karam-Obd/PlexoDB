import { Accent } from '../core/enums/accent'
import { formatNumber } from '../core/utils/number'
import { pluralForm } from '../core/utils/string'
import { Badge } from './shared/badge'

function TableCard() {
  return (
    <div className="table-card" data-canvas-node="true">
      <header className="flex items-center justify-between mx-2 my-1.5 cursor-grab active:cursor-grabbing select-none">
        <h3 title="users">users</h3>

        <Badge accent={Accent.MUTED}>
          <span className="circle-sm bg-success-300 mr-1"></span>
          <span title={`${formatNumber(2241, 'standard')}`}>
            {formatNumber(2241)} {pluralForm(2214, 'row')}
          </span>
        </Badge>
      </header>

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
  )
}

export { TableCard }
