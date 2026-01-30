import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from 'src/common/events/events.service';
import { SlackService, SlackTemplateType } from 'src/external/slack/slack.service';
import { TodoEvents, TodoItemCompletedEvent } from 'src/modules/todo-items/events/publisher';
@Injectable()
export class NotificationsEventHandler {
  private readonly slackNotificationsChannel: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly slackService: SlackService,
  ) {
    this.slackNotificationsChannel = this.configService.getOrThrow('SLACK_NOTIFICATIONS_CHANNEL');
  }

  @OnEvent(TodoEvents.TODO_ITEM_COMPLETED, 'notifications.todo_item_completed')
  async handleTodoItemCompletedEvent({ title }: TodoItemCompletedEvent) {
    try {
      await this.slackService.sendMessage({
        channel: this.slackNotificationsChannel,
        template: SlackTemplateType.SIMPLE,
        data: {
          title: 'Todo Item Completed',
          body: `The todo item "${title}" has been completed.`,
        },
      });
    } catch (error) {
      console.error('Failed to send Slack notification for todo item completion:', error);
    }
  }
}
