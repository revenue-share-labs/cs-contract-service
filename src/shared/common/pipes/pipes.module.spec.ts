import { Test } from '@nestjs/testing';
import { PipesModule } from './pipes.module';

describe('PipesModule', () => {
  it('should compile the module', async () => {
    const pipesModule: PipesModule = await Test.createTestingModule({
      imports: [PipesModule],
    }).compile();

    expect(pipesModule).toBeDefined();
  });
});
