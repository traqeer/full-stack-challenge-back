import { Body, Controller, Post } from '@nestjs/common';
import { SendSlackMessage } from 'src/modules/notifications/use-cases/send-slack-message';
import { TestSlackDto } from './dto';

@Controller('notifications')
export class NotificationsAPI {
  constructor(private readonly sendSlackMessage: SendSlackMessage) {}

  @Post('test-slack')
  async testSlack(@Body() dto: TestSlackDto) {
    await this.sendSlackMessage.execute(dto.template, dto.data, dto.channel, dto.postAt);
    return { success: true };
  }
}
