import { Fragment } from 'react'
import { messageFormat } from '../core/utils/string'
import { objectsDiffBlocks } from '../core/utils/objects-diff-blocks'
import { ObjectDiffBlockTypeEnum } from '../core/enums/object-diff-block-type'
import type { TObjectDiffProps } from '../core/meta/t-component'
import locale from '../locales/en.json'

const formatDiffValue = (val: unknown, truncate?: boolean) => {
  if (val === undefined) return 'undefined'
  if (val === null) return 'null'
  return truncate ? JSON.stringify(val) : JSON.stringify(val, null, 2)
}

function ObjectDiff({ cur, prev, limit, prioritizeChanges, truncate }: TObjectDiffProps) {
  if (!cur && !prev) return

  const { blocks, overflow } = objectsDiffBlocks(cur, prev, limit, prioritizeChanges)

  return (
    <>
      <div className={`object-diff ${truncate ? 'is-truncated' : ''}`}>
        <table>
          <tbody>
            {blocks.map(b => (
              <Fragment key={b.id}>
                {b.type == ObjectDiffBlockTypeEnum.Update && (
                  <tr className="minus">
                    <td>
                      <code>-</code>
                    </td>
                    <td title={truncate ? formatDiffValue(b.prevValue, false) : undefined}>
                      <code>{b.key}:</code>
                      <code>{formatDiffValue(b.prevValue, truncate)}</code>
                    </td>
                  </tr>
                )}
                <tr className={b.type != ObjectDiffBlockTypeEnum.None ? (b.type == ObjectDiffBlockTypeEnum.Add || b.type == ObjectDiffBlockTypeEnum.Update ? 'plus' : 'minus') : ''}>
                  <td>{b.type != ObjectDiffBlockTypeEnum.None && <code>{b.type == ObjectDiffBlockTypeEnum.Add || b.type == ObjectDiffBlockTypeEnum.Update ? '+' : '-'}</code>}</td>
                  <td title={truncate ? formatDiffValue(b.value, false) : undefined}>
                    <code className={b.type == ObjectDiffBlockTypeEnum.None ? 'text-muted-300' : ''}>{b.key}:</code>
                    <code>{formatDiffValue(b.value, truncate)}</code>
                  </td>
                </tr>
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
      {!!overflow && (
        <div className="text-muted-300 bg-surface-200 border-top-primary-100 mb-2 px-3 py-1">
          <span>{messageFormat(overflow, locale.common.labels.moreFields)}</span>
        </div>
      )}
    </>
  )
}

export { ObjectDiff }
