import { ContractDeployedRecord } from './contract-deployed.record';

describe('ContractDeployedRecord', () => {
  it('check fields of dto.', async () => {
    const contractDeployedRecord: ContractDeployedRecord = {
      deploymentId: 'deploymentId',
      contractId: 'contractId',
    };
    expect({
      deploymentId: 'deploymentId',
      contractId: 'contractId',
    }).toEqual(contractDeployedRecord);
  });
  it('check instanceof dto.', () => {
    const contractDeployedRecord = new ContractDeployedRecord();
    expect(contractDeployedRecord).toBeInstanceOf(ContractDeployedRecord);
  });
});
