import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

/**
 * Wraps all successful responses in the standard { data, message } envelope.
 *
 * Controllers can return:
 *   { data, message }  → passes through as-is
 *   { data, meta, message } → passes through as-is (paginated lists)
 *   anything else → wraps in { data: value }
 */
@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((value) => {
        // Already in envelope format — pass through
        if (
          value !== null &&
          typeof value === 'object' &&
          'data' in value
        ) {
          return value;
        }
        // Wrap plain values
        return { data: value };
      }),
    );
  }
}
