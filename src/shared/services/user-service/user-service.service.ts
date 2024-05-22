import { HttpService } from '@nestjs/axios';
import { AuthStorageService } from '../storage/auth-storage.service';
import { UserDto } from './dto/user.dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserServiceService {
  constructor(
    private readonly httpService: HttpService,
    private readonly authStorageService: AuthStorageService,
  ) {}

  async getUserDetails(id: string): Promise<UserDto> {
    const { data } = await this.httpService.axiosRef.get<UserDto>(`/${id}`, {
      headers: {
        Authorization: `Bearer ${this.authStorageService.serviceJwt}`,
      },
    });
    return data;
  }
}
