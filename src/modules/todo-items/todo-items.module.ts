import { Module } from '@nestjs/common';
import { EventsModule } from 'src/common/events/events.module';
import { GetAllTodoItemsUseCase } from 'src/modules/todo-items/use-cases/get-all-todo-items.use-case';
import { TodoItemsAPI } from './api/api';
import { TodoItemsDB } from './todo-item.db';

@Module({
  imports: [EventsModule],
  controllers: [TodoItemsAPI],
  providers: [TodoItemsDB, GetAllTodoItemsUseCase],
  exports: [GetAllTodoItemsUseCase],
})
export class TodoItemsModule {}
