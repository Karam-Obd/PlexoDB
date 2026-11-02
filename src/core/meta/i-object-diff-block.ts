import type { TNullable } from './t-shared'
import type { ObjectDiffBlockTypeEnum } from '../enums/object-diff-block-type'

interface IObjectDiffBlock {
  id: string
  key: string
  value: unknown
  prevValue: TNullable<unknown>
  type: ObjectDiffBlockTypeEnum
}

export type { IObjectDiffBlock }
