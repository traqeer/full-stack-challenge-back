import { Injectable } from '@nestjs/common';
import { GetAllTodoItemsUseCase } from 'src/modules/todo-items/use-cases/get-all-todo-items.use-case';

export interface DailyCompletionReport {
  date: string;
  completedCount: number;
  totalCount: number;
  completionRate: number;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

@Injectable()
export class GetDailyCompletionReport {
  constructor(private readonly getAllTodoItemsUseCase: GetAllTodoItemsUseCase) {}

  async execute(dateRange?: DateRange): Promise<DailyCompletionReport[]> {
    const { startDate, endDate } = dateRange || this.getDefaultDateRange();

    const allItems = await this.getAllTodoItemsUseCase.execute();

    const dailyStats = new Map<string, { total: number; completed: number }>();

    for (const item of allItems) {
      if (item.createdAt >= startDate && item.createdAt <= endDate) {
        const dateKey = item.createdAt.toISOString().split('T')[0];

        if (!dailyStats.has(dateKey)) {
          dailyStats.set(dateKey, { total: 0, completed: 0 });
        }

        const stats = dailyStats.get(dateKey)!;
        stats.total++;

        if (item.completed) {
          stats.completed++;
        }
      }
    }

    const reports: DailyCompletionReport[] = [];
    for (const [date, stats] of dailyStats.entries()) {
      reports.push({
        date,
        completedCount: stats.completed,
        totalCount: stats.total,
        completionRate: stats.total > 0 ? (stats.completed / stats.total) * 100 : 0,
      });
    }

    reports.sort((a, b) => a.date.localeCompare(b.date));

    return reports;
  }

  private getDefaultDateRange(): DateRange {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);

    return { startDate, endDate };
  }
}
