import { IsObject, IsOptional, IsString } from 'class-validator';
import {
  CustomMessageData,
  SimpleMessageData,
  SlackTemplateType,
} from 'src/external/slack/slack.service';

export class TestSlackDto {
  @IsString()
  template: SlackTemplateType;

  @IsObject()
  data: SimpleMessageData | CustomMessageData;

  @IsString()
  channel: string;

  @IsOptional()
  postAt?: number;
}
