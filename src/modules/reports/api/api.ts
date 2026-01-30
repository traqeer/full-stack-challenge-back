import { Controller, Get, Query } from '@nestjs/common';
import { GetDailyCompletionReport } from 'src/modules/reports/use-cases/get-daily-completion-report.use-case';

@Controller('reports')
export class ReportsAPI {
  constructor(private readonly getDailyCompletionReportUseCase: GetDailyCompletionReport) {}

  @Get('daily-completion')
  async getDailyCompletionReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    if (startDate && endDate) {
      return this.getDailyCompletionReportUseCase.execute({
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      });
    }

    return this.getDailyCompletionReportUseCase.execute();
  }
}
