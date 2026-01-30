import { GetDailyCompletionReport } from 'src/modules/reports/use-cases/get-daily-completion-report.use-case';
import { DateRangeDto } from './dto';

export class ReportsAPI {
  constructor(private readonly getDailyCompletionReportUseCase: GetDailyCompletionReport) {}

  async getDailyCompletionReport(dateRange?: DateRangeDto) {
    return this.getDailyCompletionReportUseCase.execute(dateRange);
  }
}
