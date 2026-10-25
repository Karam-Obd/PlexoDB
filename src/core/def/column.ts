import { Base } from './base'
import { DataType } from '../enums/data-type'
import { KeyType } from '../enums/key-type'
import type { IColumn } from '../meta/i-column'
import type { TForeignKeyTarget, TNullable, TOptional } from '../meta/t-shared'

class Column extends Base<IColumn> implements IColumn {
  id!: string
  name!: TNullable<string>
  dataType!: DataType
  keyType!: KeyType
  isNullable!: boolean
  defaultValue!: TNullable<string>
  foreignKeyTarget!: TOptional<TForeignKeyTarget>

  deserialize({ id = '', name = null, dataType = DataType.OTHER, keyType = KeyType.NONE, isNullable = false, defaultValue = null, foreignKeyTarget }: Partial<IColumn> = {}): void {
    this.primaryKey('id', id)
    this.name = name
    this.dataType = dataType
    this.keyType = keyType
    this.isNullable = isNullable
    this.defaultValue = defaultValue
    this.foreignKeyTarget = foreignKeyTarget
  }
}

export { Column }
