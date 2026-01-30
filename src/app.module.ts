import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { CommonCacheModule } from 'src/common/cache/cache.module';
import { GlobalExceptionFilter } from 'src/common/global-exception.filter';
import { MongoConnection, MongodbModule } from 'src/common/mongodb/mongodb.module';
import { EventsModule } from './common/events/events.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ReportsModule } from './modules/reports/reports.module';
import { TodoItemsModule } from './modules/todo-items/todo-items.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    EventsModule.forRoot({
      isGlobal: true,
    }),

    MongodbModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        connections: (() => {
          const connections: MongoConnection[] = [];

          connections.push({
            name: 'default',
            uri: configService.getOrThrow<string>('MONGODB_URI'),
          });

          return connections;
        })(),
      }),
      inject: [ConfigService],
    }),
    CommonCacheModule,
    TodoItemsModule,
    ReportsModule,
    NotificationsModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
