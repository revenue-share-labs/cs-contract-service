export enum DefenderTransactionStatus {
  SUBMITTED = 'SUBMITTED',
  MINED = 'MINED',
  CONFIRMED = 'CONFIRMED',
  FAILED = 'FAILED',
  PENDING = 'PENDING',
  SENT = 'SENT',
  INMEMPOOL = 'INMEMPOOL',
}

export class DefenderTransactionRecord {
  hash: string;
  transactionId: string;
  status: string;
}
