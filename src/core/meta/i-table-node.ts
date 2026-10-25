import { MutationActionEnum } from '../enums/mutation-action'
import { SchemaEnum } from '../enums/schema'
import type { IColumn } from './i-column'
import type { TNullable, TOptional, TPosition } from './t-shared'

interface ITableNode {
  id: string
  name: TNullable<string>
  schema: SchemaEnum
  columns: IColumn[]
  rowCount: number
  position: TPosition
  lastAction: TOptional<MutationActionEnum>
  lastActivityAt: TOptional<number>
}

export type { ITableNode }
