import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

/**
 * HTTP Request Logging Interceptor
 * Logs all incoming HTTP requests with detailed information
 * 
 * Logged information:
 * - HTTP method and URL
 * - Request timestamp
 * - Response status code
 * - Request duration
 * - IP address and User-Agent
 * - Request size (Content-Length)
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const startTime = Date.now();

    const { method, url, ip, headers } = request;
    const userAgent = headers['user-agent'] || 'Unknown';
    const contentLength = headers['content-length'] || '0';
    const timestamp = new Date().toISOString();

    // Log incoming request
    this.logger.log(
      `🔵 [${timestamp}] → ${method} ${url} | IP: ${ip} | UA: ${this.truncateUserAgent(userAgent)} | Size: ${contentLength}B`
    );

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          const { statusCode } = response;
          const statusIcon = this.getStatusIcon(statusCode);
          
          // Log successful response
          this.logger.log(
            `${statusIcon} [${new Date().toISOString()}] ← ${method} ${url} | Status: ${statusCode} | Duration: ${duration}ms`
          );
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          const statusCode = error.status || 500;
          
          // Log error response
          this.logger.error(
            `🔴 [${new Date().toISOString()}] ← ${method} ${url} | Status: ${statusCode} | Duration: ${duration}ms | Error: ${error.message}`
          );
        },
      })
    );
  }

  /**
   * Get status icon based on HTTP status code
   */
  private getStatusIcon(statusCode: number): string {
    if (statusCode >= 200 && statusCode < 300) {
      return '🟢'; // Success
    } else if (statusCode >= 300 && statusCode < 400) {
      return '🟡'; // Redirect
    } else if (statusCode >= 400 && statusCode < 500) {
      return '🟠'; // Client Error
    } else {
      return '🔴'; // Server Error
    }
  }

  /**
   * Truncate User-Agent string for cleaner logs
   */
  private truncateUserAgent(userAgent: string): string {
    if (userAgent.length > 50) {
      return userAgent.substring(0, 47) + '...';
    }
    return userAgent;
  }
} 