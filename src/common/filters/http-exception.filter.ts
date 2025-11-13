import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiErrorResponseDto } from '../dto/api-error-response.dto';

interface HttpExceptionResponse {
  statusCode?: number;
  message?: string | string[];
  error?: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error: string | undefined;
    let errors: string[] | undefined;

    //   Handle HttpException
    if (exception instanceof HttpException) {
      status = exception.getStatus();

      const rawResponse = exception.getResponse();
      const exceptionResponse = rawResponse as HttpExceptionResponse;

      if (typeof exceptionResponse.message === 'string') {
        message = exceptionResponse.message;
      }

      if (Array.isArray(exceptionResponse.message)) {
        // Validation error
        errors = exceptionResponse.message;
        message = 'Validation failed';
      }

      if (exceptionResponse.error) {
        error = exceptionResponse.error;
      }
    }

    //   Handle normal Error
    else if (exception instanceof Error) {
      message = exception.message;
      error = exception.name;
    }

    //   Logging
    this.logger.error(
      `${request.method} ${request.url} - Status: ${status} - Error: ${message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    //   Build Response DTO
    const errorResponse = new ApiErrorResponseDto(
      message,
      status,
      error,
      errors,
      request.url,
    );

    return response.status(status).json(errorResponse);
  }
}
