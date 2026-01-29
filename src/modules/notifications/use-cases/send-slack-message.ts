import { Injectable } from '@nestjs/common';
import { Block } from '@slack/web-api';
import { AppError } from 'src/common/base.error';
import {
  CustomMessageData,
  SimpleMessageData,
  SlackService,
  SlackTemplateType,
} from '../../../external/slack/slack.service';

@Injectable()
export class SendSlackMessage {
  constructor(private readonly slackService: SlackService) {}

  async execute(
    template: SlackTemplateType,
    data: SimpleMessageData | CustomMessageData,
    channel: string,
    postAt?: number,
  ) {
    if (template === SlackTemplateType.SIMPLE && 'title' in data && 'body' in data) {
      await this.executeSimple(data.title, data.body, channel, postAt);
      return;
    }
    if (template === SlackTemplateType.CUSTOM && 'blocks' in data) {
      await this.executeCustom(data.blocks, channel, postAt);
      return;
    }
    throw new AppError(
      'invalid_template_data',
      'The provided data does not match the template type',
    );
  }

  async executeSimple(title: string, body: string, channel: string, postAt?: number) {
    await this.slackService.sendMessage({
      channel,
      template: SlackTemplateType.SIMPLE,
      data: { title, body },
      postAt,
    });
  }

  async executeCustom(blocks: Block[], channel: string, postAt?: number) {
    await this.slackService.sendMessage({
      channel,
      template: SlackTemplateType.CUSTOM,
      data: { blocks },
      postAt,
    });
  }
}
