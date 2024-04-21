import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Logger,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from 'src/user/user.service';
import { CreateUserPartialDto } from 'src/dto/create-user.dto';
import { Response } from 'express';
import { Login } from './interface/login.interface';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('register')
  async register(
    @Res() res: Response,
    @Body() createUserDto: CreateUserPartialDto,
  ) {
    const createdUser = await this.userService.createUser(createUserDto);
    await this.authService.createEmailToken(createUserDto.email);
    const sent = await this.authService.sendEmailVerification(
      createUserDto.email,
    );

    if (sent) {
      return res.status(HttpStatus.CREATED).json({
        success: true,
        message: `We have sent you email on this email ${createUserDto.email}, please verify email`,
      });
    } else {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'REGISTRATION.ERROR.MAIL_NOT_SENT',
      });
    }
  }
  @Get('email/verify/:token')
  public async verifyEmail(
    @Param('token') token: string,
    @Res() res: Response,
  ) {
    try {
      const isEmailVerified = await this.authService.verifyEmail(token);
      if (isEmailVerified) {
        return res.end('<h1>email is verified</h1>');
      } else {
        return res.end('<h1>email is verified</h1>');
      }
      // res
      // .status(HttpStatus.OK)
      // .json({ message: 'LOGIN.EMAIL_VERIFIED', isEmailVerified });
    } catch (error) {
      Logger.log(error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'REGISTRATION.ERROR.MAIL_NOT_SENT',
      });
    }
  }

  @Post('email/login')
  async login(@Body() login: Login, @Res() res: Response, @Req() req: Request) {
    const response = await this.authService.validateLogin(
      login.email,
      login.password,
    );
    return res.status(HttpStatus.OK).json({ success: true, ...response });
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('protected')
  async protected(@Req() req: any) {
    return { user: req.user };
  }

  @Get('check-username/:username')
  async checkUsernameAvailability(
    @Param('username') username: string,
  ): Promise<{ available: boolean }> {
    const isAvailable = await this.userService.isUsernameAvailable(username);
    return { available: isAvailable };
  }

  @Get('email/resend-verification/:email')
  public async sendEmailVerification(
    @Param('email') email: string,
    @Res() res: Response,
  ) {
    await this.authService.createEmailToken(email);
    const isEmailSent = await this.authService.sendEmailVerification(email);
    return res
      .status(HttpStatus.OK)
      .json({ success: true, isEmailSent: !!isEmailSent });
  }
}
