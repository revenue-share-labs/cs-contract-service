import { UserDto } from '../../services/user-service/dto';
import { UserServiceService } from '../../services/user-service/user-service.service';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TokenPayloadDto } from './dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private readonly userService: UserServiceService,
    @Inject('JWT_SECRET') jwtSecret: string,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtSecret,
      ignoreExpiration: false,
    });
  }

  async validate(payload: TokenPayloadDto): Promise<UserDto> {
    try {
      const user = await this.userService.getUserDetails(payload.sub);
      return user;
    } catch (err) {
      this.logger.error(err);
    }
  }
}
