const pluralFormat = (count: number, text: string): string => {
  const rule = new Intl.PluralRules('en-US').select(count)
  return rule === 'one' ? text : `${text}s`
}

const messageFormat = (count: number | string, pattern: string | Record<string, string>) => {
  if (typeof pattern === 'string') {
    return pattern.replace('{0}', count.toString())
  }
  const num = typeof count === 'number' ? count : Number(count)
  const rule = new Intl.PluralRules('en-US').select(num)
  const message = pattern[rule]
  return message.replace('{0}', count.toString())
}

export { pluralFormat, messageFormat }
