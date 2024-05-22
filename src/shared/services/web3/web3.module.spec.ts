import { Test } from '@nestjs/testing';
import { Web3Module } from './web3.module';

describe('Web3Module', () => {
  it('should compile the module', async () => {
    const web3Module: Web3Module = await Test.createTestingModule({
      imports: [Web3Module],
    }).compile();

    expect(web3Module).toBeDefined();
  });
});
