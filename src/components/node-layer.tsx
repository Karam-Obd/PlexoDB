import { useSchemaStore } from '../store/schema-store'
import { TableCard } from './table-card'

function NodeLayer() {
  const tableIds = useSchemaStore(state => state.tableIds)

  return (
    <>
      {tableIds.map(tableId => (
        <TableCard key={tableId} tableId={tableId} />
      ))}
    </>
  )
}

export { NodeLayer }
