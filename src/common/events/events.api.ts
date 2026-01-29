import { Body, Controller, Post } from '@nestjs/common';
import { PublishEventDto, PublishEventResponseDto } from './dtos';
import { EventBus } from './events.service';

@Controller('events')
export class EventsApi {
  constructor(private readonly eventBus: EventBus) {}

  @Post('publish')
  async publishEvent(@Body() dto: PublishEventDto): Promise<PublishEventResponseDto> {
    try {
      await this.eventBus.publish(dto.topic, dto.data || {});

      return {
        success: true,
        message: `Event published successfully to topic: ${dto.topic} with data: ${JSON.stringify(dto.data)}`,
        topic: dto.topic,
        timestamp: new Date(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to publish event: ${errorMessage}`);
    }
  }
}
