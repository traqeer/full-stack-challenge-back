import { Module } from '@nestjs/common';
import { TodoItemsModule } from 'src/modules/todo-items/todo-items.module';
import { GetDailyCompletionReport } from './use-cases/get-daily-completion-report.use-case';

@Module({
  imports: [TodoItemsModule],
  providers: [GetDailyCompletionReport],
  exports: [],
})
export class ReportsModule {}
