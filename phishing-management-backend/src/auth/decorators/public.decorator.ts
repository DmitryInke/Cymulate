import { SetMetadata } from '@nestjs/common';

/**
 * Decorator key for marking endpoints that should skip JWT authentication
 * Used by JwtAuthGuard to identify public endpoints within protected controllers
 */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Decorator to mark controller methods as public (skip JWT authentication)
 * 
 * Usage:
 * @Public()
 * @Post('public-endpoint')
 * async publicMethod() { ... }
 * 
 * This allows specific endpoints within a JWT-protected controller
 * to be accessible without authentication (e.g., click tracking, webhooks)
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true); 