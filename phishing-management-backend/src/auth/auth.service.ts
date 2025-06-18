import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { CreateUserDto, LoginUserDto } from '../users/dto/create-user.dto';
import { User } from '../users/user.schema';
import { JwtPayload } from './strategies/jwt.strategy';

/**
 * Authentication response interface
 * Standardizes the response format for login and registration endpoints
 */
export interface AuthResponse {
  /** JWT access token for authenticated requests */
  accessToken: string;
  /** User data without sensitive information (password excluded) */
  user: Omit<User, 'password'>;
}

/**
 * Service responsible for user authentication operations
 * Handles user registration, login, and JWT token generation
 * 
 * Features:
 * - User registration with automatic JWT token generation
 * - User login with credential validation
 * - JWT token creation with user payload
 * - Consistent response format for auth operations
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Registers a new user and returns authentication data
   * 
   * @param createUserDto - User registration data (email, password)
   * @returns Promise<AuthResponse> - JWT token and user data
   * 
   * @throws ConflictException - If user with email already exists (from UsersService)
   * @throws Error - If user creation or token generation fails
   * 
   * Process:
   * 1. Create new user account via UsersService
   * 2. Generate JWT payload with user ID and email
   * 3. Sign JWT token with payload
   * 4. Return token and user data
   */
  async register(createUserDto: CreateUserDto): Promise<AuthResponse> {
    // Create new user (handles email uniqueness validation and password hashing)
    const user = await this.usersService.create(createUserDto);
    
    // Create JWT payload with user identifier and email
    const payload: JwtPayload = { 
      sub: user.id!, // User ID as subject (! assertion safe due to DB auto-generation)
      email: user.email 
    };
    
    return {
      accessToken: this.jwtService.sign(payload),
      user, // Password already excluded via schema toJSON transform
    };
  }

  /**
   * Authenticates user credentials and returns authentication data
   * 
   * @param loginUserDto - User login data (email, password)
   * @returns Promise<AuthResponse> - JWT token and user data
   * 
   * @throws UnauthorizedException - If credentials are invalid
   * @throws Error - If token generation fails
   * 
   * Process:
   * 1. Validate user credentials via UsersService
   * 2. Generate JWT payload with user ID and email
   * 3. Sign JWT token with payload
   * 4. Return token and user data
   */
  async login(loginUserDto: LoginUserDto): Promise<AuthResponse> {
    // Validate user credentials (returns user data if valid, null if invalid)
    const user = await this.usersService.validateUser(
      loginUserDto.email,
      loginUserDto.password,
    );

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Create JWT payload with user identifier and email
    const payload: JwtPayload = { 
      sub: user.id!, // User ID as subject (! assertion safe due to validation success)
      email: user.email 
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user, // Password already excluded via toJSON transform in validateUser
    };
  }
} 