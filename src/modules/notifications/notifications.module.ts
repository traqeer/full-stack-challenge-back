import { Module } from '@nestjs/common';
import { EventsModule } from 'src/common/events/events.module';
import { SlackModule } from 'src/external/slack/slack.module';
import { SendSlackMessage } from 'src/modules/notifications/use-cases/send-slack-message';
import { NotificationsAPI } from './api/api';
import { NotificationsEventHandler } from './events/handler';

@Module({
  imports: [EventsModule, SlackModule],
  controllers: [NotificationsAPI],
  providers: [NotificationsEventHandler, SendSlackMessage],
  exports: [],
})
export class NotificationsModule {}
