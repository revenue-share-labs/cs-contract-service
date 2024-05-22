import { Injectable } from '@nestjs/common';
import { Interface, LogDescription } from 'ethers';

const RSC_VALVE_CREATED = 'RSCValveCreated';
export type Log = {
  topics: Array<string>;
  data: string;
};

@Injectable()
export class EvmService {
  getRscContractAddress(abi: string, logs: Log[]): string {
    const rscValveCreatedLog = this.findLogByName(abi, logs, RSC_VALVE_CREATED);
    return rscValveCreatedLog.args[0];
  }

  getRscContractCreationId(abi: string, logs: Log[]): string {
    const rscValveCreatedLog = this.findLogByName(abi, logs, RSC_VALVE_CREATED);
    return rscValveCreatedLog.args[7];
  }

  private findLogByName(
    abi: string,
    logs: Log[],
    targetName: string,
  ): LogDescription {
    const parsedLogs = this.parseLogs(abi, logs);
    return parsedLogs.find((log) => log.name === targetName);
  }

  private parseLogs(abi: string, logs: Log[]): LogDescription[] {
    const contractInterface = new Interface(abi);
    return logs.map((log) => {
      return contractInterface.parseLog(log);
    });
  }
}
