import { calculateCubicBezierPath, getSocketSides } from '../core/utils/bezier'
import { CARD_WIDTH, getSocketCoordinates } from '../core/utils/coordinates'
import { useSchemaStore } from '../store/schema-store'

function EdgeLayer() {
  const edges = useSchemaStore(state => state.edges)
  const tables = useSchemaStore(state => state.tables)

  return (
    <svg
      className="pointer-events-none absolute inset-0 overflow-visible"
      style={{ width: '100%', height: '100%' }}
    >
      <defs>
        <filter id="wire-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {edges.map(edge => {
        const sourceTable = tables[edge.sourceTableId]
        const targetTable = tables[edge.targetTableId]

        if (!sourceTable || !targetTable) return null

        const { sourceSide, targetSide } = getSocketSides(
          sourceTable.position.x + CARD_WIDTH / 2,
          targetTable.position.x + CARD_WIDTH / 2
        )

        const start = getSocketCoordinates(sourceTable, edge.sourceFieldName, sourceSide)
        const end = getSocketCoordinates(targetTable, edge.targetFieldName, targetSide)

        const pathD = calculateCubicBezierPath(
          start.x,
          start.y,
          end.x,
          end.y,
          sourceSide,
          targetSide
        )

        return (
          <g key={edge.id} className="relation-edge">
            {/* Subtle glow layer */}
            <path
              d={pathD}
              fill="none"
              stroke="var(--info-200)"
              strokeWidth={3}
              strokeOpacity={0.25}
              strokeLinecap="round"
            />
            {/* Main wire line */}
            <path
              d={pathD}
              fill="none"
              stroke="var(--info-300)"
              strokeWidth={1.5}
              strokeOpacity={0.85}
              strokeLinecap="round"
            />
            {/* Start socket port: housing + pin */}
            <circle
              cx={start.x}
              cy={start.y}
              r={4}
              fill="var(--surface)"
              stroke="var(--info-300)"
              strokeWidth={1.5}
            />
            <circle
              cx={start.x}
              cy={start.y}
              r={1.75}
              fill="var(--info-300)"
            />

            {/* End socket port: housing + pin */}
            <circle
              cx={end.x}
              cy={end.y}
              r={4}
              fill="var(--surface)"
              stroke="var(--info-300)"
              strokeWidth={1.5}
            />
            <circle
              cx={end.x}
              cy={end.y}
              r={1.75}
              fill="var(--info-300)"
            />
          </g>
        )
      })}
    </svg>
  )
}

export { EdgeLayer }
