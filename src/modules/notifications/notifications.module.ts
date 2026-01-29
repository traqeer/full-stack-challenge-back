import { Module } from '@nestjs/common';
import { SlackModule } from 'src/external/slack/slack.module';
import { NotificationsAPI } from './api/api';
@Module({
  imports: [SlackModule],
  controllers: [NotificationsAPI],
  providers: [],
  exports: [],
})
export class NotificactionModule {}
