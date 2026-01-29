import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class NotificationsEventHandler {
  private readonly slackNotificationsChannel: string;
  private readonly slackIANotificationsChannel: string;

  constructor(private readonly configService: ConfigService) {
    this.slackNotificationsChannel = this.configService.getOrThrow('SLACK_NOTIFICATIONS_CHANNEL');
    this.slackIANotificationsChannel = this.configService.getOrThrow(
      'SLACK_IA_NOTIFICATIONS_CHANNEL',
    );
  }
}
