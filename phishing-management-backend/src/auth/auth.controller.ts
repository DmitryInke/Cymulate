import { Controller, Post, Body, HttpCode, HttpStatus, BadRequestException, Get, UseGuards, Request, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from '../users/dto/create-user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() createUserDto: CreateUserDto,
    @Res({ passthrough: true }) res: Response
  ) {
    try {
      const result = await this.authService.register(createUserDto);
      
      // Set JWT token in HttpOnly cookie
      res.cookie('accessToken', result.accessToken, {
        httpOnly: true,        // JavaScript cannot access this cookie
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        sameSite: 'strict',    // CSRF protection
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/',
      });

      return {
        user: result.user,
        message: 'Registration successful'
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginUserDto: LoginUserDto,
    @Res({ passthrough: true }) res: Response
  ) {
    try {
      const result = await this.authService.login(loginUserDto);
      
      // Set JWT token in HttpOnly cookie
      res.cookie('accessToken', result.accessToken, {
        httpOnly: true,        // JavaScript cannot access this cookie
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        sameSite: 'strict',    // CSRF protection
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/',
      });

      return {
        user: result.user,
        message: 'Login successful'
      };
    } catch (error) {
      throw new BadRequestException('Invalid credentials');
    }
  }

  /**
   * Verify current user's JWT token and return user data
   * Protected endpoint that validates the token in cookies
   * 
   * @param req - Request object with user data from JWT strategy
   * @returns Current user data if token is valid
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req: any) {
    return {
      user: req.user,
      message: 'Token is valid'
    };
  }

  /**
   * Logout user by clearing the authentication cookie
   * 
   * @param res - Response object for clearing the cookie
   * @returns Logout confirmation message
   */
  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    // Clear the authentication cookie
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });
    
    return { 
      message: 'Logout successful' 
    };
  }
} 