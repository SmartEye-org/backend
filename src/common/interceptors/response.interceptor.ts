import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponseDto } from '../dto/api-response.dto';
import { Request } from 'express';

interface ResponseWithSuccess {
  success: boolean;
  [key: string]: unknown;
}

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponseDto<T> | ResponseWithSuccess>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponseDto<T> | ResponseWithSuccess> {
    const request = context.switchToHttp().getRequest<Request>();
    const path = request.url;

    return next.handle().pipe(
      map((data: T | ResponseWithSuccess) => {
        // Type guard to check if data is already wrapped
        if (this.isWrappedResponse(data)) {
          return data;
        }

        // Wrap the response
        const response = new ApiResponseDto<T>(data);
        response.path = path;
        return response;
      }),
    );
  }

  /**
   * Type guard to check if response is already wrapped
   */
  private isWrappedResponse(data: unknown): data is ResponseWithSuccess {
    return (
      data !== null &&
      typeof data === 'object' &&
      'success' in data &&
      typeof (data as ResponseWithSuccess).success === 'boolean'
    );
  }
}
