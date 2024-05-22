import { CustomDecorator, SetMetadata } from '@nestjs/common';
import { UserRole } from '../../services/user-service/dto';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]): CustomDecorator =>
  SetMetadata(ROLES_KEY, roles);
