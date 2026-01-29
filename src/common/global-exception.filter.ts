import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { request, Response } from 'express';
import { AppError, ErrorPrefix } from './base.error';

const ERROR_PREFIX_MAP: Record<ErrorPrefix, HttpStatus> = {
  auth_: HttpStatus.UNAUTHORIZED,
  forbidden_: HttpStatus.FORBIDDEN,
  not_found_: HttpStatus.NOT_FOUND,
  invalid_: HttpStatus.BAD_REQUEST,
  conflict_: HttpStatus.CONFLICT,
};

function getErrorStatus(code: string): HttpStatus {
  const prefix = Object.keys(ERROR_PREFIX_MAP).find(p => code.startsWith(p)) as
    | ErrorPrefix
    | undefined;
  return prefix ? ERROR_PREFIX_MAP[prefix] : HttpStatus.BAD_REQUEST;
}

interface ValidationErrorResponse {
  message: string[];
  error: string;
  statusCode: number;
}

@Catch()
@Injectable()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly isDevelopment: boolean;

  constructor(private readonly configService: ConfigService) {
    this.isDevelopment = this.configService.getOrThrow<string>('NODE_ENV') === 'development';
  }
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Log detallado en ambiente de desarrollo
    if (this.isDevelopment) {
      console.log('\n=== Error Details ===');
      console.log('Timestamp:', new Date().toISOString());
      console.log('Request URL:', request.method, request.url);
      console.log('Request Body:', request.body);
      console.log('Request Headers:', request.headers);
      console.log('Error Type:', exception?.constructor?.name);
      console.log('Error Stack:', exception instanceof Error ? exception.stack : 'No stack trace');
      console.log('Error Details:', JSON.stringify(exception, null, 2));
      console.log('===================\n');
    }

    // Handle ValidationPipe errors
    if (exception instanceof BadRequestException) {
      const validationResponse = exception.getResponse() as ValidationErrorResponse;
      if (validationResponse.message && Array.isArray(validationResponse.message)) {
        // This is a validation error
        return response.status(HttpStatus.BAD_REQUEST).json({
          code: 'invalid_request',
          message: 'Validation failed',
          errors: validationResponse.message.map((msg: string) => ({
            message: msg,
          })),
        });
      }
    }

    // Nest HTTP exceptions pass through
    if (exception instanceof HttpException) {
      return response.status(exception.getStatus()).json(exception.getResponse());
    }

    // Convert AppErrors to HTTP responses
    if (exception instanceof AppError) {
      const status = getErrorStatus(exception.code);
      return response.status(status).json({ code: exception.code, message: exception.message });
    }

    // Unknown errors become 500s
    return response
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ code: 'internal_error', message: 'Internal server error' });
  }
}
