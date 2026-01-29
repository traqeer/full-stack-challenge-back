import { Body, Controller, Delete, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { EventBus } from 'src/common/events/events.service';
import { TodoEvents, TodoItemCompletedEvent } from 'src/modules/todo-items/events/publisher';
import { TodoItemsDB } from '../todo-item.db';
import {
  CreateTodoItemDto,
  ReorderTodoItemsDto,
  TodoItemResponseDto,
  UpdateTodoItemDto,
} from './dtos';
@Controller('todos')
export class TodoItemsAPI {
  constructor(
    private readonly todoItemsDB: TodoItemsDB,
    private readonly eventBus: EventBus,
  ) {}

  @Get()
  async findAll(): Promise<TodoItemResponseDto[]> {
    const todoItems = await this.todoItemsDB.findAll();
    return todoItems.map(item => new TodoItemResponseDto(item));
  }

  @Post()
  async create(@Body() createDto: CreateTodoItemDto): Promise<TodoItemResponseDto> {
    const todoItem = await this.todoItemsDB.createTodoItem({
      title: createDto.title,
      description: createDto.description ?? null,
      completed: false,
    });
    return new TodoItemResponseDto(todoItem);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateTodoItemDto,
  ): Promise<TodoItemResponseDto> {
    const todoItem = await this.todoItemsDB.updateTodoItem(id, {
      title: updateDto.title,
      description: updateDto.description,
    });
    return new TodoItemResponseDto(todoItem);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    await this.todoItemsDB.deleteTodoItem(id);
  }

  @Patch('reorder')
  async reorder(@Body() reorderDto: ReorderTodoItemsDto): Promise<void> {
    await this.todoItemsDB.reorderTodoItems(reorderDto.items);
  }

  @Patch(':id/toggle-completed')
  async toggleCompleted(@Param('id') id: string): Promise<TodoItemResponseDto> {
    const todoItem = await this.todoItemsDB.findById(id);
    const completed = !todoItem.completed;

    const updatedTodoItem = await this.todoItemsDB.updateTodoItem(id, {
      completed,
    });

    if (completed) {
      await this.eventBus.publish<TodoItemCompletedEvent>(TodoEvents.TODO_ITEM_COMPLETED, {
        id,
        title: updatedTodoItem.title,
      });
    }
    return new TodoItemResponseDto(updatedTodoItem);
  }
}
