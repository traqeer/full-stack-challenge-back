import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventsApi } from './events.api';
import { EventBus } from './events.service';

interface EventsModuleOptions {
  isGlobal?: boolean;
  rabbitmqUrl?: string;
}

@Module({})
export class EventsModule {
  static forRoot(options: EventsModuleOptions = {}): DynamicModule {
    const isGlobal = options.isGlobal ?? true;

    return {
      module: EventsModule,
      global: isGlobal,
      imports: [
        RabbitMQModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            uri: options.rabbitmqUrl || configService.getOrThrow<string>('RABBITMQ_URL'),
            exchanges: [
              {
                name: 'todos',
                type: 'topic',
              },
            ],
          }),
        }),
      ],
      providers: [EventBus],
      controllers: [EventsApi],
      exports: [EventBus, RabbitMQModule],
    };
  }
}
