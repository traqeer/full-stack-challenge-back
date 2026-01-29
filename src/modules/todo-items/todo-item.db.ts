import { Inject, Injectable } from '@nestjs/common';
import { Db } from 'mongodb';
import { AppError } from 'src/common/base.error';
import { GetDatabaseInteface } from 'src/common/mongodb/mongodb.module';
import { v4 as uuidv4 } from 'uuid';

export interface TodoItem {
  _id: string;
  title: string;
  description: string | null;
  completed: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export type CreateTodoItemInput = Omit<
  TodoItem,
  '_id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'order'
>;

export type UpdateTodoItemInput = Partial<
  Omit<TodoItem, '_id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'order'>
>;

export interface ReorderTodoItemInput {
  id: string;
  order: number;
}

@Injectable()
export class TodoItemsDB {
  private readonly collection = 'todoItems';
  private db: Db;

  constructor(
    @Inject('MONGODB_DATABASES')
    private readonly getDatabase: GetDatabaseInteface,
  ) {
    this.db = this.getDatabase('default');
  }

  async createTodoItem(input: CreateTodoItemInput): Promise<TodoItem> {
    const id = uuidv4();

    // Obtener el máximo order actual
    const maxOrderItem = await this.db
      .collection<TodoItem>(this.collection)
      .find({ deletedAt: null })
      .sort({ order: -1 })
      .limit(1)
      .toArray();

    const nextOrder = maxOrderItem.length > 0 ? maxOrderItem[0].order + 1 : 0;

    const todoItem: Partial<TodoItem> = {
      _id: id,
      title: input.title,
      completed: input.completed,
      order: nextOrder,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    if (input.description !== undefined) {
      todoItem.description = input.description;
    }

    await this.db.collection<TodoItem>(this.collection).insertOne(todoItem as TodoItem);

    return todoItem as TodoItem;
  }

  async findById(id: string): Promise<TodoItem> {
    const todoItem = await this.db
      .collection<TodoItem>(this.collection)
      .findOne({ _id: id, deletedAt: null });

    if (!todoItem) {
      throw new AppError('not_found_todo_item', 'Todo item not found');
    }

    return todoItem;
  }

  async findAll(): Promise<TodoItem[]> {
    const todoItems = await this.db
      .collection<TodoItem>(this.collection)
      .find({ deletedAt: null })
      .sort({ order: 1 })
      .toArray();

    return todoItems;
  }

  async updateTodoItem(id: string, data: UpdateTodoItemInput): Promise<TodoItem> {
    const updateData = {
      ...data,
      updatedAt: new Date(),
    };

    const updatedTodoItem = await this.db
      .collection<TodoItem>(this.collection)
      .findOneAndUpdate(
        { _id: id, deletedAt: null },
        { $set: updateData },
        { returnDocument: 'after' },
      );

    if (!updatedTodoItem) {
      throw new AppError('not_found_todo_item', 'Todo item not found');
    }

    return updatedTodoItem;
  }

  async deleteTodoItem(id: string): Promise<void> {
    const result = await this.db
      .collection<TodoItem>(this.collection)
      .findOneAndUpdate(
        { _id: id, deletedAt: null },
        { $set: { deletedAt: new Date() } },
        { returnDocument: 'after' },
      );

    if (!result) {
      throw new AppError('not_found_todo_item', 'Todo item not found');
    }
  }

  async reorderTodoItems(items: ReorderTodoItemInput[]): Promise<void> {
    const bulkOps = items.map(item => ({
      updateOne: {
        filter: { _id: item.id, deletedAt: null },
        update: { $set: { order: item.order, updatedAt: new Date() } },
      },
    }));

    if (bulkOps.length > 0) {
      await this.db.collection<TodoItem>(this.collection).bulkWrite(bulkOps);
    }
  }
}
