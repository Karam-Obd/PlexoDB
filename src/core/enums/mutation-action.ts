import { AccentEnum } from './accent'

enum MutationActionEnum {
  INSERT,
  UPDATE,
  DELETE
}

const MutationActionEnumAccentMap = {
  [MutationActionEnum.INSERT]: AccentEnum.INFO,
  [MutationActionEnum.UPDATE]: AccentEnum.WARNING,
  [MutationActionEnum.DELETE]: AccentEnum.DANGER
}

export { MutationActionEnum, MutationActionEnumAccentMap }
