import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';

/**
 * JWT token payload interface
 * Defines the structure of data stored in JWT tokens
 * 
 * Standard JWT claims:
 * - sub: Subject (user ID) - RFC 7519 standard
 * - Custom claims: email for additional user context
 */
export interface JwtPayload {
  /** User ID (MongoDB ObjectId) - standard 'sub' claim */
  sub: string;
  /** User email address for additional context */
  email: string;
}

/**
 * JWT authentication strategy for Passport
 * Validates JWT tokens and extracts user information for protected routes
 * 
 * Features:
 * - Extracts JWT from Authorization header (Bearer token)
 * - Validates token signature and expiration
 * - Retrieves current user data from database
 * - Transforms user data for request context
 * 
 * Used by JwtAuthGuard to protect routes requiring authentication
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    super({
      // Extract JWT token from Authorization header as Bearer token
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // Reject expired tokens (security best practice)
      ignoreExpiration: false,
      // Secret key for token signature verification
      secretOrKey: process.env.JWT_SECRET || 'default-secret',
    });
  }

  /**
   * Validates JWT payload and retrieves user data
   * Called automatically by Passport after successful token verification
   * 
   * @param payload - Decoded JWT payload containing user ID and email
   * @returns Promise<any> - User data (without password) for request context
   * 
   * @throws UnauthorizedException - If user not found or database error
   * 
   * Process:
   * 1. Extract user ID from JWT payload
   * 2. Fetch current user data from database
   * 3. Transform and return user data (password excluded)
   * 4. User data becomes available as req.user in protected routes
   */
  async validate(payload: JwtPayload) {
    try {
      // Fetch user by ID from JWT payload (validates user still exists)
      const user = await this.usersService.findById(payload.sub);
      
      // Return user data without password (via toJSON transform)
      // This becomes req.user in protected route handlers
      return user.toJSON();
    } catch {
      // Throw UnauthorizedException for any errors (user not found, DB errors, etc.)
      throw new UnauthorizedException('Invalid token or user not found');
    }
  }
} 