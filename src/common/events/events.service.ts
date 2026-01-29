import { Injectable } from '@nestjs/common';
import { AmqpConnection, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';

export const EXCHANGE_NAME = 'traqeer';

@Injectable()
export class EventBus {
  constructor(private readonly amqpConnection: AmqpConnection) {}

  async publish<T>(topic: string, data: T): Promise<void> {
    await this.amqpConnection.publish(EXCHANGE_NAME, topic, data);
  }
}

export function OnEvent(topic: string, queue: string) {
  return RabbitSubscribe({
    exchange: EXCHANGE_NAME,
    routingKey: topic,
    queue: queue,
  });
}
