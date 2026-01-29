import { Body, Controller, Delete, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { TodoItemsDB } from '../todo-item.db';
import {
  CreateTodoItemDto,
  ReorderTodoItemsDto,
  TodoItemResponseDto,
  UpdateTodoItemDto,
} from './dtos';

@Controller('api/v1/todos')
export class TodoItemsAPI {
  constructor(private readonly todoItemsDB: TodoItemsDB) {}

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
      completed: createDto.completed ?? false,
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
      completed: updateDto.completed,
    });
    return new TodoItemResponseDto(todoItem);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    await this.todoItemsDB.deleteTodoItem(id);
    return { message: 'Todo item deleted successfully' };
  }

  @Patch('reorder')
  async reorder(@Body() reorderDto: ReorderTodoItemsDto): Promise<{ message: string }> {
    await this.todoItemsDB.reorderTodoItems(reorderDto.items);
    return { message: 'Todo items reordered successfully' };
  }
}
