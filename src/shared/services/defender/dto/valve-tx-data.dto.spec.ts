import { ValveTxDataDto } from './valve-tx-data.dto';

describe('ValveTxDataDto', () => {
  it('check fields of dto.', async () => {
    const creationId = new Uint8Array();
    const valveTxDataDto: ValveTxDataDto = {
      controller: '0x0',
      distributors: ['0x0'],
      minAutoDistributeAmount: '0',
      initialRecipients: ['0x0'],
      percentages: ['0'],
      creationId: creationId,
    };
    expect({
      controller: '0x0',
      distributors: ['0x0'],
      minAutoDistributeAmount: '0',
      initialRecipients: ['0x0'],
      percentages: ['0'],
      creationId: creationId,
    }).toEqual(valveTxDataDto);
  });
  it('check instanceof dto.', () => {
    const valveTxDataDto = new ValveTxDataDto();
    expect(valveTxDataDto).toBeInstanceOf(ValveTxDataDto);
  });
});
