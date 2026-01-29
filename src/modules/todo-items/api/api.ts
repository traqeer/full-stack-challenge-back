import { Body, Controller, Delete, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { TodoItemsDB } from '../todo-item.db';
import {
  CreateTodoItemDto,
  ReorderTodoItemsDto,
  TodoItemResponseDto,
  UpdateTodoItemDto,
} from './dtos';

@Controller('todos')
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
      completed: false,
    });
    return new TodoItemResponseDto(todoItem);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateTodoItemDto,
  ): Promise<TodoItemResponseDto> {
    console.log('Update DTO:', updateDto);
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
    const updatedTodoItem = await this.todoItemsDB.updateTodoItem(id, {
      completed: !todoItem.completed,
    });
    return new TodoItemResponseDto(updatedTodoItem);
  }
}
