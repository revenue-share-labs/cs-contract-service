import { ContractDeployFailedRecord } from './contract-deploy-failed.record';

describe('ContractDeployFailedRecord', () => {
  it('check fields of dto.', async () => {
    const contractDeployFailedRecord: ContractDeployFailedRecord = {
      deploymentId: 'deploymentId',
      contractId: 'contractId',
      errorDetails: {
        message: 'message',
      },
    };
    expect({
      deploymentId: 'deploymentId',
      contractId: 'contractId',
      errorDetails: {
        message: 'message',
      },
    }).toEqual(contractDeployFailedRecord);
  });
  it('check instanceof dto.', () => {
    const contractDeployFailedRecord = new ContractDeployFailedRecord();
    expect(contractDeployFailedRecord).toBeInstanceOf(
      ContractDeployFailedRecord,
    );
  });
});
