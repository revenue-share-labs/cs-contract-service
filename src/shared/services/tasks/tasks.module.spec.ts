import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { mockDeep } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';
import { PrismaModule } from '../prisma/prisma.module';
import { TasksModule } from './tasks.module';

describe('TasksModule', () => {
  it('should compile the module', async () => {
    const tasksModule: TasksModule = await Test.createTestingModule({
      imports: [TasksModule, PrismaModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockDeep<PrismaClient>())
      .compile();

    expect(tasksModule).toBeDefined();
  });
});
