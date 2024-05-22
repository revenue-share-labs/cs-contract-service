export class ValveTxDataDto {
  controller: string;
  distributors: string[];
  isImmutableRecipients?: boolean;
  isAutoNativeCurrencyDistribution?: boolean;
  minAutoDistributeAmount: string;
  initialRecipients: string[];
  percentages: string[];
  creationId: Uint8Array;
}
