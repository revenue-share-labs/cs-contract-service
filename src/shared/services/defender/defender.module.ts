import { Global, Module } from '@nestjs/common';
import { MumbaiDefenderService } from './mumbai-defender.service';

@Global()
@Module({
  providers: [MumbaiDefenderService],
  exports: [MumbaiDefenderService],
})
export class DefenderModule {}
