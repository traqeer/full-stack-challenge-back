import { Body, Controller, Delete, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { TodoItemsDB } from '../todo-item.db';
import {
  CreateTodoItemDto,
  ReorderTodoItemsDto,
  TodoItemResponseDto,
  UpdateTodoItemDto,
} from './dtos';

@Controller('api/v1/todos')
export class TodoItemsController {
  constructor(private readonly todoItemsDB: TodoItemsDB) {}

  @Get()
  async findAll(): Promise<TodoItemResponseDto[]> {
    const todoItems = await this.todoItemsDB.findAll();
    return todoItems.map(item => new TodoItemResponseDto(item));
  }

  @Post()
  async create(@Body() createDto: CreateTodoItemDto): Promise<TodoItemResponseDto> {
    const input: any = {
      title: createDto.title,
      completed: createDto.completed ?? false,
    };

    if (createDto.description !== undefined) {
      input.description = createDto.description;
    }

    const todoItem = await this.todoItemsDB.createTodoItem(input);
    return new TodoItemResponseDto(todoItem);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateTodoItemDto,
  ): Promise<TodoItemResponseDto> {
    const input: any = {};

    if (updateDto.title !== undefined) {
      input.title = updateDto.title;
    }
    if (updateDto.description !== undefined) {
      input.description = updateDto.description;
    }
    if (updateDto.completed !== undefined) {
      input.completed = updateDto.completed;
    }

    const todoItem = await this.todoItemsDB.updateTodoItem(id, input);
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
