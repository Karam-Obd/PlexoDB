import { AccentEnum } from './accent'

enum SchemaActionEnum {
  CREATE_TABLE,
  ALTER_TABLE,
  DROP_TABLE
}

const SchemaActionEnumAccentMap = {
  [SchemaActionEnum.CREATE_TABLE]: AccentEnum.SUCCESS,
  [SchemaActionEnum.ALTER_TABLE]: AccentEnum.WARNING,
  [SchemaActionEnum.DROP_TABLE]: AccentEnum.DANGER
}

export { SchemaActionEnum, SchemaActionEnumAccentMap }

