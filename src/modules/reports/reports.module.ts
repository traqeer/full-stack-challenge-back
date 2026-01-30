import { Module } from '@nestjs/common';
import { ReportsAPI } from 'src/modules/reports/api/api';
import { TodoItemsModule } from 'src/modules/todo-items/todo-items.module';
import { GetDailyCompletionReport } from './use-cases/get-daily-completion-report.use-case';

@Module({
  controllers: [ReportsAPI],
  imports: [TodoItemsModule],
  providers: [GetDailyCompletionReport],
  exports: [],
})
export class ReportsModule {}
