import { Injectable, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/skip-auth.decorator';

/**
 * Custom JWT Authentication Guard
 * Extends Passport JWT guard with support for public endpoints
 * 
 * Features:
 * - Standard JWT token validation for protected routes
 * - Bypasses authentication for endpoints marked with @Public() decorator
 * - Allows mixed public/private endpoints within same controller
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  /**
   * Determines if authentication should be bypassed for current request
   * 
   * @param context - Execution context containing request metadata
   * @returns boolean - true if endpoint is public, false if authentication required
   * 
   * Checks for @Public() decorator on both method and class level
   */
  canActivate(context: ExecutionContext) {
    // Check if endpoint is marked as public with @Public() decorator
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(), // Method level decorator
      context.getClass(),   // Class level decorator
    ]);
    
    if (isPublic) {
      return true; // Skip authentication for public endpoints
    }
    
    // Proceed with standard JWT authentication
    return super.canActivate(context);
  }
} 