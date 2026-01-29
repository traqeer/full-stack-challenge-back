import { DynamicModule, Global, Module } from '@nestjs/common';
import { Db, MongoClient, MongoError } from 'mongodb';

export type MongoConnection = {
  name: string;
  uri: string;
};

export interface MongodbModuleOptions {
  connections: MongoConnection[];
}

export interface MongoNamedClient {
  client: MongoClient;
  name: string;
}

export interface GetDatabaseInteface {
  (name: string): Db;
}

export interface MongodbModuleAsyncOptions {
  useFactory: (...args: any[]) => Promise<MongodbModuleOptions> | MongodbModuleOptions;
  inject?: any[];
}

export function isDuplicateKeyError(error: unknown): error is MongoError {
  return error instanceof MongoError && error.code === 11000;
}

@Global()
@Module({})
export class MongodbModule {
  static forRootAsync(options: MongodbModuleAsyncOptions): DynamicModule {
    return {
      module: MongodbModule,
      providers: [
        {
          provide: 'MONGODB_OPTIONS',
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
        {
          provide: 'MONGODB_CLIENTS',
          useFactory: async (options: MongodbModuleOptions) => {
            const clients: MongoNamedClient[] = [];
            for (const connection of options.connections) {
              const client = new MongoClient(connection.uri);
              await client.connect();
              clients.push({ client, name: connection.name });
            }
            return clients;
          },
          inject: ['MONGODB_OPTIONS'],
        },
        {
          provide: 'MONGODB_DATABASES',
          useFactory: (clients: MongoNamedClient[]) => {
            return function (name: string) {
              return clients.find(client => client.name === name)!.client.db();
            };
          },
          inject: ['MONGODB_CLIENTS'],
        },
      ],
      exports: ['MONGODB_DATABASES', 'MONGODB_CLIENTS'],
    };
  }
}
