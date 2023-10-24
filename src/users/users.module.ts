import { Module } from '@nestjs/common';

import { MailingModule } from 'src/mailing/mailing.module';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { SentencesModule } from 'src/sentences/sentences.module';

@Module({
  imports: [MailingModule, SentencesModule],
  providers: [UsersService],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
