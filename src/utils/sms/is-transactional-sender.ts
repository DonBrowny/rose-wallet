/**
 * Sender ID format for transactional messages in India:
 *
 * Format: XX-XXXXXX-X
 * - 2 alpha chars: Telecom circle code (e.g., AD, BZ, etc.)
 * - Hyphen separator
 * - 6 alphanumeric chars: Entity identifier
 * - Hyphen separator
 * - 1 char suffix: T (Transactional), S (Service), P (Promotional), G (Government)
 *
 * Example: AD-ICICIT-S
 *
 * This is a pre-filter to reduce ML processing load. We accept T and S suffixes,
 * then the ML classifier determines if it's an actual financial transaction.
 */

const SENDER_FORMAT_REGEX = /^[A-Z]{2}-[A-Z0-9]{6}-[TS]$/i

export function isTransactionalSender(sender: string): boolean {
  const trimmed = String(sender ?? '').trim()
  if (!trimmed) return false

  return SENDER_FORMAT_REGEX.test(trimmed)
}
