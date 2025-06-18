import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from './user.schema';
import { CreateUserDto } from './dto/create-user.dto';

/**
 * Service responsible for user management operations
 * Handles user creation, authentication, and data retrieval
 * 
 * Features:
 * - User registration with email uniqueness validation
 * - Password hashing using bcrypt with salt rounds 12
 * - User lookup by email and ID
 * - Password validation for authentication
 */
@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  /**
   * Creates a new user account
   * 
   * @param createUserDto - User registration data (email, password)
   * @returns Promise<User> - Created user without password field
   * 
   * @throws ConflictException - If user with email already exists
   * @throws Error - If database operation fails
   * 
   * Process:
   * 1. Check if user with email already exists
   * 2. Hash password using bcrypt with 12 salt rounds
   * 3. Create and save new user document
   * 4. Return user data (password excluded via schema transform)
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check for existing user to prevent duplicate emails
    const existingUser = await this.userModel.findOne({ 
      email: createUserDto.email 
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password with bcrypt (12 salt rounds for good security/performance balance)
    const hashedPassword = await bcrypt.hash(createUserDto.password, 12);
    
    // Create new user document with hashed password
    const createdUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });

    // Save to database and return (password excluded via schema toJSON transform)
    return createdUser.save();
  }

  /**
   * Finds user by email address
   * 
   * @param email - User email to search for
   * @returns Promise<UserDocument> - User document with all fields (including password hash)
   * 
   * @throws NotFoundException - If user with email not found
   * 
   * Note: Returns UserDocument (not User) to include password for authentication
   */
  async findOne(email: string): Promise<UserDocument> {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  /**
   * Finds user by MongoDB ObjectId
   * 
   * @param id - User ID (MongoDB ObjectId as string)
   * @returns Promise<UserDocument> - User document with all fields
   * 
   * @throws NotFoundException - If user with ID not found
   * 
   * Used primarily for JWT token validation in auth strategies
   */
  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  /**
   * Validates user credentials for authentication
   * 
   * @param email - User email address
   * @param password - Plain text password to validate
   * @returns Promise<any> - User data (without password) if valid, null if invalid
   * 
   * Process:
   * 1. Find user by email
   * 2. Compare provided password with stored hash using bcrypt
   * 3. Return user data if password matches, null otherwise
   * 4. Return null for any errors (user not found, etc.)
   * 
   * Note: Returns 'any' type because of toJSON() transform uncertainty
   */
  async validateUser(email: string, password: string): Promise<any> {
    try {
      // Find user by email (throws NotFoundException if not found)
      const user = await this.findOne(email);
      
      // Compare plain text password with stored hash
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (isPasswordValid) {
        // Return user data without password (via toJSON transform)
        return user.toJSON();
      }
      return null;
    } catch {
      // Return null for any errors (user not found, bcrypt errors, etc.)
      return null;
    }
  }
} 