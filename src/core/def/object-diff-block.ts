import { Base } from './base'
import { ObjectDiffBlockTypeEnum } from '../enums/object-diff-block-type'
import type { TNullable } from '../meta/t-shared'
import type { IObjectDiffBlock } from '../meta/i-object-diff-block'

class ObjectDiffBlock extends Base<IObjectDiffBlock> implements IObjectDiffBlock {
  id!: string
  key!: string
  value!: unknown
  prevValue!: TNullable<unknown>
  type!: ObjectDiffBlockTypeEnum

  deserialize({ id = crypto.randomUUID(), key = '-', value, prevValue, type = ObjectDiffBlockTypeEnum.None }: Partial<IObjectDiffBlock> = {}): void {
    this.primaryKey('id', id)
    this.key = key
    this.value = value
    this.prevValue = prevValue
    this.type = type
  }
}

export { ObjectDiffBlock }
