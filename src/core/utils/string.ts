const pluralFormat = (count: number, text: string): string => {
  const rule = new Intl.PluralRules('en-US').select(count)
  return rule === 'one' ? text : `${text}s`
}

const messageFormat = (count: number, map: Record<string, string>) => {
  const rule = new Intl.PluralRules('en-US').select(count)
  const message = map[rule]
  return message.replace('{0}', count.toString())
}

export { pluralFormat, messageFormat }
