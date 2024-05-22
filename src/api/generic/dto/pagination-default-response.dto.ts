import { ApiProperty } from '@nestjs/swagger';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ClassType<T = any> = new (...args: any[]) => T;

export function PaginatedDefaultResponseDto<T extends ClassType>(
  ResourceCls: T,
): ClassType {
  class Paginated {
    @ApiProperty({
      description: 'Total number of existing objects in db',
    })
    public total: number;

    @ApiProperty({
      description: 'List of objects',
      type: () => [ResourceCls],
    })
    public data: T[];
  }

  return Paginated;
}
