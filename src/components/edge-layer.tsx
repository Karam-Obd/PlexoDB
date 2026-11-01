import { useSchemaStore } from '../store/schema-store'
import { RelationEdge } from './relation-edge'

function EdgeLayer() {
  const edges = useSchemaStore(state => state.edges)

  return (
    <svg
      className="pointer-events-none absolute inset-0 overflow-visible"
      style={{ width: '100%', height: '100%' }}
    >
      {edges.map(edge => (
        <RelationEdge key={edge.id} edge={edge} />
      ))}
    </svg>
  )
}

export { EdgeLayer }
