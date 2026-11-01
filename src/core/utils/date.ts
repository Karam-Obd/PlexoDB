const formatTime = (timestamp: number, includeMilliseconds: boolean = true): string => {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    ...(includeMilliseconds ? { fractionalSecondDigits: 3 } : {}),
    hour12: false,
  })
}

export { formatTime }
