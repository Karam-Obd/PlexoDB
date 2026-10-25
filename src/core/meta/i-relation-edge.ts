import { CardinalityEnum } from '../enums/cardinality'
import type { TOptional } from './t-shared'

interface IRelationEdge {
  id: string
  sourceTableId: string
  sourceFieldName: string
  targetTableId: string
  targetFieldName: string
  cardinality: CardinalityEnum
  lastPulseAt: TOptional<number>
}

export type { IRelationEdge }
