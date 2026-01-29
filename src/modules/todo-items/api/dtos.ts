import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { TodoItem } from '../todo-item.db';

export class CreateTodoItemDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: { value: string }) => value?.trim() || undefined)
  title: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }: { value: string }) => value?.trim() || undefined)
  description?: string;
}

export class UpdateTodoItemDto {
  @IsString()
  @IsOptional()
  @Transform(({ value }: { value: string }) => value?.trim() || undefined)
  title: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }: { value: string }) => value?.trim() || undefined)
  description?: string;
}

export class ReorderItemDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsNumber()
  order: number;
}

export class ReorderTodoItemsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderItemDto)
  items: ReorderItemDto[];
}

export class TodoItemResponseDto {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(todoItem: TodoItem) {
    this.id = todoItem._id;
    this.title = todoItem.title;
    this.description = todoItem.description;
    this.completed = todoItem.completed;
    this.order = todoItem.order;
    this.createdAt = todoItem.createdAt;
    this.updatedAt = todoItem.updatedAt;
  }
}
