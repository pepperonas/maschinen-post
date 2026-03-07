export function timeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 0) return 'gerade eben'
  if (seconds < 60) return 'gerade eben'

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `vor ${minutes} Min.`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `vor ${hours} Std.`

  const days = Math.floor(hours / 24)
  if (days === 1) return 'vor 1 Tag'
  if (days < 7) return `vor ${days} Tagen`

  const weeks = Math.floor(days / 7)
  if (weeks === 1) return 'vor 1 Woche'
  if (weeks < 5) return `vor ${weeks} Wochen`

  const months = Math.floor(days / 30)
  if (months === 1) return 'vor 1 Monat'
  return `vor ${months} Monaten`
}
