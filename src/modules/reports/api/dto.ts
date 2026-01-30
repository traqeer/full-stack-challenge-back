import { Transform, Type } from 'class-transformer';
import { IsDateString, IsOptional } from 'class-validator';

export class DateRangeDto {
  @IsDateString()
  @Transform(({ value }) => (value instanceof String ? new Date(value as string) : null))
  @Type(() => Date)
  startDate: Date;

  @IsDateString()
  @Transform(({ value }) => (value instanceof String ? new Date(value as string) : null))
  @Type(() => Date)
  endDate: Date;
}

export class GetDailyCompletionReportDto {
  @IsOptional()
  @Type(() => DateRangeDto)
  dateRange?: DateRangeDto;
}
