import { Module } from '@nestjs/common';
import { TodoItemsAPI } from './api/api';
import { TodoItemsDB } from './todo-item.db';

@Module({
  controllers: [TodoItemsAPI],
  providers: [TodoItemsDB],
  exports: [],
})
export class TodoItemsModule {}
