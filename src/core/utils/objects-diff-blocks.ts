import { ObjectDiffBlock } from '../def/object-diff-block'
import { ObjectDiffBlockTypeEnum } from '../enums/object-diff-block-type'
import type { IObjectDiffBlock } from '../meta/i-object-diff-block'
import type { TNullable } from '../meta/t-shared'

const objectsDiffBlocks = (
  cur?: TNullable<Record<string, unknown>>,
  prev?: TNullable<Record<string, unknown>>,
  limit: TNullable<number> = null,
  prioritizeChanges = false
) => {
  const blocks = [] as IObjectDiffBlock[]
  const queue = [] as IObjectDiffBlock[]
  let overflow = 0

  if (!cur && !prev) return { blocks, overflow }
  else if (cur && !prev) {
    Object.entries(cur).forEach(([key, value]) => {
      if (limit && blocks.length == limit) {
        overflow++
        return
      }
      blocks.push(new ObjectDiffBlock({ key, value, type: ObjectDiffBlockTypeEnum.Add }))
    })
  } else if (prev && !cur) {
    Object.entries(prev).forEach(([key, value]) => {
      if (limit && blocks.length == limit) {
        overflow++
        return
      }
      blocks.push(new ObjectDiffBlock({ key, value, type: ObjectDiffBlockTypeEnum.Delete }))
    })
  } else if (cur && prev) {
    Object.entries(cur).forEach(([key, value]) => {
      const isChanged = value !== prev[key]
      if (limit && blocks.length == limit) {
        overflow++
        return
      }
      if (!isChanged && prioritizeChanges) {
        queue.push(new ObjectDiffBlock({ key, value, prevValue: null, type: ObjectDiffBlockTypeEnum.None }))
        overflow++
        return
      }
      blocks.push(new ObjectDiffBlock({ key, value, prevValue: isChanged ? prev[key] : null, type: isChanged ? ObjectDiffBlockTypeEnum.Update : ObjectDiffBlockTypeEnum.None }))
    })

    if (!!limit && !!queue.length && blocks.length < limit) {
      queue.slice(0, limit - blocks.length).forEach(q => {
        blocks.push({ ...q })
        overflow--
      })
    }
  }
  return { blocks, overflow }
}

export { objectsDiffBlocks }
