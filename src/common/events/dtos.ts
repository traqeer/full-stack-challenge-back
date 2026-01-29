import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class PublishEventDto {
  @IsString()
  @IsNotEmpty()
  topic: string;

  @IsObject()
  @IsOptional()
  data?: Record<string, any>;

  @IsString()
  @IsOptional()
  queue?: string;
}

export class PublishEventResponseDto {
  success: boolean;
  message: string;
  topic: string;
  timestamp: Date;
}
