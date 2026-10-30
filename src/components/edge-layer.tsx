import { calculateCubicBezierPath, getPointOnCubicBezier, getSocketSides } from '../core/utils/bezier'
import { CARD_WIDTH, getSocketCoordinates } from '../core/utils/coordinates'
import { useSchemaStore } from '../store/schema-store'
import locale from '../locales/en.json'

function EdgeLayer() {
  const edges = useSchemaStore(state => state.edges)
  const tables = useSchemaStore(state => state.tables)

  return (
    <svg className="pointer-events-none absolute inset-0 overflow-visible" style={{ width: '100%', height: '100%' }}>
      {edges.map(edge => {
        const sourceTable = tables[edge.sourceTableId]
        const targetTable = tables[edge.targetTableId]

        if (!sourceTable || !targetTable) return null

        const { sourceSide, targetSide } = getSocketSides(sourceTable.position.x + CARD_WIDTH / 2, targetTable.position.x + CARD_WIDTH / 2)

        const start = getSocketCoordinates(sourceTable, edge.sourceFieldName, sourceSide)
        const end = getSocketCoordinates(targetTable, edge.targetFieldName, targetSide)

        const pathD = calculateCubicBezierPath(start.x, start.y, end.x, end.y, sourceSide, targetSide)
        const midPoint = getPointOnCubicBezier(0.5, start.x, start.y, end.x, end.y, sourceSide, targetSide)
        const cardinalityLabel = locale.common.enum.CardinalityEnum[edge.cardinality as unknown as keyof typeof locale.common.enum.CardinalityEnum] ?? '1:N'

        return (
          <g key={edge.id} className="relation-edge">
            {/* Subtle glow layer */}
            <path d={pathD} fill="none" stroke="var(--info-200)" strokeWidth={3} strokeOpacity={0.25} strokeLinecap="round" />
            {/* Main wire line */}
            <path d={pathD} fill="none" stroke="var(--info-300)" strokeWidth={1.5} strokeOpacity={0.85} strokeLinecap="round" />

            {/* Relational Wire Heartbeat Breath */}
            {edge.lastPulseAt && (
              <g key={edge.lastPulseAt} className="pointer-events-none">
                {/* Ambient soft glow breath */}
                <path d={pathD} fill="none" stroke="var(--info-300)" strokeLinecap="round" className="wire-heartbeat-glow" />
                {/* High-intensity core breath */}
                <path d={pathD} fill="none" stroke="#ffffff" strokeLinecap="round" className="wire-heartbeat-core" />
                {/* Pulsing badge glow */}
                <rect
                  x={-16}
                  y={-10}
                  width={32}
                  height={20}
                  rx={5}
                  fill="none"
                  stroke="var(--info-300)"
                  className="badge-heartbeat-glow"
                  transform={`translate(${midPoint.x}, ${midPoint.y})`}
                />
              </g>
            )}

            {/* Cardinality badge at curve midpoint */}
            <g className="cardinality-badge pointer-events-none" transform={`translate(${midPoint.x}, ${midPoint.y})`}>
              <rect
                x={-16}
                y={-10}
                width={32}
                height={20}
                rx={5}
                fill="var(--surface-300)"
                stroke="var(--muted-200)"
                strokeWidth={1}
              />
              <text
                textAnchor="middle"
                dominantBaseline="central"
                fill="var(--muted-300)"
                fontSize={11}
                fontWeight={600}
                fontFamily="var(--font-mono)"
                className="select-none"
              >
                {cardinalityLabel}
              </text>
            </g>

            {/* Start socket port: housing + pin */}
            <circle cx={start.x} cy={start.y} r={4.5} fill="var(--surface-300)" stroke="var(--info-300)" strokeWidth={1.5} />
            <circle cx={start.x} cy={start.y} r={2} fill="var(--info-300)" />

            {/* End socket port: housing + pin */}
            <circle cx={end.x} cy={end.y} r={4.5} fill="var(--surface-300)" stroke="var(--info-300)" strokeWidth={1.5} />
            <circle cx={end.x} cy={end.y} r={2} fill="var(--info-300)" />
          </g>
        )
      })}
    </svg>
  )
}

export { EdgeLayer }
