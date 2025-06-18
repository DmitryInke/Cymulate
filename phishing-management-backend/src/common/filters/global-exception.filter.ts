import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { MongoError } from 'mongodb';

/**
 * Global exception filter to handle all application errors
 * Provides consistent error responses and prevents server crashes
 * 
 * Features:
 * - Handles HTTP exceptions with proper status codes
 * - Converts MongoDB errors to user-friendly messages
 * - Provides detailed error info in development
 * - Logs all errors for debugging
 * - Prevents server crashes from unhandled exceptions
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  /**
   * Catches and processes all exceptions in the application
   * 
   * @param exception - Any error thrown in the application
   * @param host - Execution context for extracting request/response
   * 
   * Error handling priorities:
   * 1. HTTP exceptions (BadRequestException, etc.) - preserve status and message
   * 2. MongoDB errors - convert to user-friendly messages
   * 3. Validation errors - extract field-specific messages
   * 4. Unknown errors - return generic 500 with safe message
   */
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let details: any = undefined;

    // Handle different types of exceptions
    if (exception instanceof HttpException) {
      // HTTP exceptions (BadRequestException, UnauthorizedException, etc.)
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || exception.message;
        details = (exceptionResponse as any).details;
      }
    } else if (this.isMongoError(exception)) {
      // MongoDB specific errors
      const mongoError = this.handleMongoError(exception);
      status = mongoError.status;
      message = mongoError.message;
      details = mongoError.details;
    } else if (exception instanceof Error) {
      // Generic JavaScript errors
      message = exception.message || 'An unexpected error occurred';
      
      // In development, provide more details
      if (process.env.NODE_ENV === 'development') {
        details = {
          name: exception.name,
          stack: exception.stack,
        };
      }
    }

    // Log the error for debugging
    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${message}`
    );

    // Send structured error response
    const errorResponse = {
      success: false,
      statusCode: status,
      message,
      error: HttpStatus[status] || 'Unknown Error',
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      ...(details && { details }), // Include details only if present
      ...(process.env.NODE_ENV === 'development' && {
        // Additional debug info in development
        originalError: exception instanceof Error ? exception.message : String(exception),
      }),
    };

    response.status(status).json(errorResponse);
  }

  /**
   * Checks if error is a MongoDB/Mongoose error
   */
  private isMongoError(exception: unknown): exception is MongoError {
    return (
      exception instanceof MongoError ||
      (exception as any)?.name?.includes('Mongo') ||
      (exception as any)?.name?.includes('Cast') ||
      (exception as any)?.name === 'ValidationError'
    );
  }

  /**
   * Converts MongoDB errors to user-friendly messages
   * 
   * @param exception - MongoDB/Mongoose error
   * @returns Object with status, message, and optional details
   */
  private handleMongoError(exception: any): {
    status: number;
    message: string;
    details?: any;
  } {
    // MongoDB duplicate key error (E11000)
    if (exception.code === 11000) {
      const field = Object.keys(exception.keyPattern || {})[0] || 'field';
      return {
        status: HttpStatus.CONFLICT,
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`,
        details: {
          field,
          value: exception.keyValue?.[field],
        },
      };
    }

    // Mongoose validation error
    if (exception.name === 'ValidationError') {
      const errors = Object.values(exception.errors || {}).map((err: any) => ({
        field: err.path,
        message: err.message,
        value: err.value,
      }));

      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'Validation failed',
        details: { errors },
      };
    }

    // Mongoose CastError (invalid ObjectId, etc.)
    if (exception.name === 'CastError') {
      const field = exception.path === '_id' ? 'ID' : exception.path;
      return {
        status: HttpStatus.BAD_REQUEST,
        message: `Invalid ${field} format`,
        details: {
          field: exception.path,
          expectedType: exception.kind,
          receivedValue: exception.value,
        },
      };
    }

    // Generic MongoDB error
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Database operation failed',
      details: process.env.NODE_ENV === 'development' ? {
        errorName: exception.name,
        errorCode: exception.code,
      } : undefined,
    };
  }
} 