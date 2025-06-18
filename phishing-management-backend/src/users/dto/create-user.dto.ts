import { IsEmail, IsString, MinLength } from 'class-validator';

/**
 * Data Transfer Object for user registration
 * Validates input data for creating new user accounts
 * 
 * Validation rules:
 * - Email must be valid email format
 * - Password must be at least 6 characters long
 * - All fields are required
 */
export class CreateUserDto {
  /**
   * User email address
   * Must be a valid email format (validated by @IsEmail decorator)
   * Will be converted to lowercase and trimmed in the schema
   */
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  /**
   * User password (plain text)
   * Minimum 6 characters required for basic security
   * Will be hashed using bcrypt before storing in database
   */
  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;
}

/**
 * Data Transfer Object for user authentication
 * Validates input data for user login requests
 * 
 * Validation rules:
 * - Email must be valid email format
 * - Password is required (no minimum length check for login)
 */
export class LoginUserDto {
  /**
   * User email address for authentication
   * Must match existing user email in database
   */
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  /**
   * User password (plain text)
   * Will be compared against hashed password in database
   * No minimum length validation for login (already validated at registration)
   */
  @IsString({ message: 'Password must be a string' })
  password: string;
} 