/**
 * Sender ID format for transactional messages in India (from 6th May 2025):
 *
 * Format: XXXXXX-X
 * - 6 alphanumeric chars: Entity identifier
 * - Hyphen separator
 * - 1 char suffix: T (Transactional), S (Service), P (Promotional), G (Government)
 *
 * This is a pre-filter to reduce ML processing load. We accept T and S suffixes,
 * then the ML classifier determines if it's an actual financial transaction.
 */

const SENDER_FORMAT_REGEX = /^[A-Z0-9]{6}-[TS]$/i

export function isTransactionalSender(sender: string): boolean {
  const trimmed = String(sender ?? '').trim()
  if (!trimmed) return false

  return SENDER_FORMAT_REGEX.test(trimmed)
}
