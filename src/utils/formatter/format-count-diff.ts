export function formatCountDiff(current: number, previous: number): string {
  const diff = current - previous
  if (diff > 0) return `+${diff}`
  if (diff < 0) return `${diff}`
  return '0'
}
