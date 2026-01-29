import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Block, KnownBlock, WebClient } from '@slack/web-api';

export enum SlackTemplateType {
  SIMPLE = 'simple',
  CUSTOM = 'custom',
}

export interface SimpleMessageData {
  title: string;
  body: string;
}

export interface CustomMessageData {
  blocks: Block[];
}

export type SlackMessageOptions =
  | {
      channel: string;
      template: SlackTemplateType.SIMPLE;
      data: SimpleMessageData;
      postAt?: number;
    }
  | {
      channel: string;
      template: SlackTemplateType.CUSTOM;
      data: CustomMessageData;
      postAt?: number;
    };

@Injectable()
export class SlackService {
  private readonly client: WebClient;

  constructor(private readonly configService: ConfigService) {
    const token = this.configService.getOrThrow<string>('SLACK_BOT_TOKEN');
    this.client = new WebClient(token);
  }

  async sendMessage(options: SlackMessageOptions) {
    const { channel, template, data, postAt } = options;

    const blocks =
      template === SlackTemplateType.SIMPLE
        ? this.buildSimpleMessage(data.title, data.body)
        : data.blocks;

    if (postAt) {
      return await this.client.chat.scheduleMessage({
        channel,
        blocks: blocks,
        post_at: postAt,
      });
    } else {
      return await this.client.chat.postMessage({
        channel,
        blocks,
        mrkdwn: true,
      });
    }
  }

  buildSimpleMessage(title: string, body: string): KnownBlock[] {
    return [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*${title}*\n${body}`,
        },
      },
    ];
  }
}
