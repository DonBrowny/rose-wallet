Rose Wallet — SMS Pattern Review (Spec)

1) Overview

Rose Wallet groups bank SMS into Patterns (families of similar messages). Users review a pattern by looking at full messages with highlighted extractions, make quick corrections, and then approve/reject the pattern. No per-SMS state; all decisions are at the Pattern level.

Goals

Make SMS parsing transparent and fixable without exposing regex.

Let users approve a pattern once so future SMS auto-extract cleanly.

Keep the UI calm, focused, and fast.

2) Entities & Data Model
// Primary entity
type Pattern = {
  id: string
  bank: string                  // derived from sender
  state: 'action_needed' | 'approved' | 'rejected'
  messages: SMS[]
  last_seen_at: string          // ISO
  count: number                 // messages.length
  summary: {
    amount_range?: { min: number; max: number }
    common_merchant?: string | null
    date_span?: { from: string; to: string } // ISO
  }
  candidate_rule?: {
    version: number
    // internal representation (hidden from user)
  }
}

type SMS = {
  id: string
  raw_text: string
  received_at: string           // ISO
  bank: string                  // inferred from sender
  extracted: {
    amount?: number             // editable
    merchant?: string           // editable
    datetime?: string           // readonly
  }
  confidence?: {
    overall?: number            // 0..1
    amount?: number
    merchant?: number
    datetime?: number
  }
  conflicts?: string[]          // e.g., "multiple numbers detected"
}


Notes

No per-SMS state. state lives on Pattern only.

Approving a pattern acknowledges it correctly extracts across its SMS set.

3) States

Action needed (default): Needs review/fixes.

Approved: Rule is accepted; future matching SMS auto-extract.

Rejected: Not used for extraction; restorable.

4) Screens
4.1 Patterns Overview (List)

Each row is a Pattern card:

Left: Bank badge, title (e.g., “UPI debit”), small summary
“₹500–₹2,700 • MINVANI QUALITY • Aug–Sep”

Right: State chip + primary CTA Review (n); secondary Reject

Collapsed group: “Similar messages (12)”

Shows 2–3 representative full SMS with highlighted tokens (Amount, Merchant, DateTime)

“See all (12)” → opens Review modal

No global filters/search. Groups are collapsed by default to keep performance and scannability.

4.2 Pattern Review (Modal/Screen)

Header

Bank badge • 12 messages • State chip • Last seen “2h ago”

Body (two areas)

Message viewer

One full SMS at a time (carousel: “1/12”)

Highlights:

Amount (violet), Merchant (blue), Date/Time (yellow)

Toggle: Show candidates (dotted underline on alternates when parser is unsure)

Extraction panel

Editable: Amount, Merchant

Read-only: Bank, Date/Time

Primary action: Save & test

On save: create/update candidate_rule, re-run extraction on a different SMS from the same pattern, update highlights

Feedback line:

✅ “Updated rule · matching 11/12”

⚠️ “2 messages need attention” + Jump to next

Footer actions

Approve pattern (primary)

Enabled after at least one Save & test; ok to approve with “exceptions” → prompt to split outliers.

Reject pattern (secondary) with quick reasons (Not a transaction / Spam / Wrong bank / Other)

Split outliers (if some messages can’t be matched) → creates a new Action needed pattern for them.

Success banners

Approved: “Pattern approved · future SMS will auto-extract.”

Rejected: “Pattern rejected · won’t be used for extraction.”

Split: “Created a new pattern (2 messages).”

5) Learning Loop (User Edits → System Learns)

User edits Amount/Merchant for the current message.

Save & test → update hidden candidate_rule.

System tests on a different SMS in the pattern (prefer the next failing one).

Show match count (“now matching X/Y”) and highlight updates live.

Repeat until all match, or offer Split outliers.

User never sees raw rules; only impact (counts + live highlights).

6) Visual Language & Components

State chips

Action needed → amber “Review”

Approved → green “Approved”

Rejected → grey outline “Rejected”

Highlights legend (subtle): • Amount • Merchant • Date

Typography

Amounts: IBM Plex Mono (aMd/aLg variants)

Other text: Manrope

Interactions

Tap a highlighted token → jump cursor to that field in the panel (quick edit)

48dp hit targets; ripple feedback

7) Edge Cases

Multiple numbers in SMS (amount vs reference) → show alternates; editing picks the correct one and trains the rule.

Debit vs credit → small badge; prevent approving credits as expenses unless user flips a toggle.

Duplicates → warn if same amount/merchant/timestamp already approved.

Mixed date formats → normalize before display.

Large groups → virtualize; lazy-load messages in the modal.

8) Accessibility

Highlights use non-color cues (underline styles + labels).

Read order: header → message → panel → footer actions.

Screen reader example:
“Message 3 of 12. Amount detected ₹500. Merchant MINVANI QUALITY. Press Save & test to update rule.”

Buttons ≥48dp; semantic labels on chips and actions.

9) Analytics / Telemetry

pattern_opened, review_opened, save_and_test, approve_pattern, reject_pattern, split_pattern

match_rate_before, match_rate_after, edits_count_amount, edits_count_merchant

jump_to_next_clicked, time-to-approve

10) Acceptance Criteria

 Patterns list shows collapsed groups with counts and representative SMS.

 Review modal shows full SMS with live highlights.

 Editing amount/merchant and clicking Save & test updates the rule and tests on a different SMS.

 UI shows now matching X/Y and allows Jump to next failing message.

 Approve/Reject works at Pattern level; Undo available.

 Split outliers creates a new Action needed pattern.

 No global filters/search present.

 A11y roles/labels set; 48dp targets.

11) Copy (Draft)

Overview row: “Review similar messages (12)”

Learning feedback: “Updated rule · matching 11/12” / “2 still need attention”

Approve CTA: “Approve pattern”
Sub: “Future SMS will auto-extract”

Reject CTA: “Reject pattern”
Sub: “Won’t be used for extraction”

Split prompt: “Create a new pattern for the remaining 2 messages?”

12) Non-Goals (v1)

No per-SMS approval state.

No global filters/search.

No raw rule editing UI.

No cross-pattern merge/split beyond the “Split outliers” helper.

13) Future Enhancements

Confidence heat map per field; auto-sort failing messages to the top.

“Apply to ledger” bulk action on approve.

Background re-train to auto-fix near-duplicates.

SMS import history and audit trail.

14) Appendix
Example SMS & Highlights

Dear UPI user A/C X0606 debited by ₹500.0 on date 20Aug25 trf to MINVANI QUALITY Refno 523266777145. If not u? call 1800111109. — SBI

Amount → ₹500.0

Merchant → MINVANI QUALITY

Date → 20Aug25

Bank → SBI (sender)