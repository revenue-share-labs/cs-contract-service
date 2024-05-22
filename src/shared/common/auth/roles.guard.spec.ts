import { UserRole } from '../../services/user-service/dto/user.dto';
import { Reflector } from '@nestjs/core';
import { mockDeep } from 'jest-mock-extended';
import { ExecutionContext } from '@nestjs/common';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });
  it('should return true with auth', () => {
    reflector.getAllAndOverride = jest
      .fn()
      .mockReturnValue([UserRole.ADMIN, UserRole.CUSTOMER, UserRole.PARTNER]);
    const context = mockDeep<ExecutionContext>({
      funcPropSupport: true,
      fallbackMockImplementation: () => ({
        switchToHttp: jest.fn().mockReturnThis(),
        getRequest: jest.fn().mockReturnValue({
          user: {
            roles: [UserRole.ADMIN],
          },
        }),
      }),
    });

    const canActivate = guard.canActivate(context);
    expect(canActivate).toBe(true);
  });
});
