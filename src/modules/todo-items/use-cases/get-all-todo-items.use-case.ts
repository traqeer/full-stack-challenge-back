import { Injectable } from '@nestjs/common';
import { TodoItem, TodoItemsDB } from '../todo-item.db';

@Injectable()
export class GetAllTodoItemsUseCase {
  constructor(private readonly todoItemsDB: TodoItemsDB) {}

  async execute(): Promise<TodoItem[]> {
    return this.todoItemsDB.findAll();
  }
}
