export interface ErrorDetails {
  readonly message: string;
}

export class ContractDeployFailedRecord {
  readonly deploymentId: string;
  readonly contractId: string;
  readonly errorDetails: ErrorDetails;
}
