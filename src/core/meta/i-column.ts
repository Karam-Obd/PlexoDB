import { DataTypeEnum } from '../enums/data-type'
import { KeyTypeEnum } from '../enums/key-type'
import type { TForeignKeyTarget, TNullable, TOptional } from './t-shared'

interface IColumn {
  id: string
  name: TNullable<string>
  dataType: DataTypeEnum
  keyType: KeyTypeEnum
  isNullable: boolean
  defaultValue: TNullable<string>
  foreignKeyTarget: TOptional<TForeignKeyTarget>
}

export type { IColumn }
