export enum PatternStatus {
  NeedsReview = 'needs-review',
  Approved = 'approved',
  Rejected = 'rejected',
}

export enum PatternType {
  Debit = 'debit',
  Credit = 'credit',
}

export type PatternStatusType = `${PatternStatus}`
export type PatternTypeType = `${PatternType}`
