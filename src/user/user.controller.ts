import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Logger,
  NotFoundException,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserService } from './user.service';
import { CreateUserPartialDto } from 'src/dto/create-user.dto';
import { Response } from 'express';
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async createUser(
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
    @Body() createUserDto: CreateUserPartialDto,
  ) {
    const result = await this.userService.createUser(file, createUserDto);
    return res.status(HttpStatus.CREATED).json({
      message: 'User has been created successfully',
      user: result,
    });
  }

  @Get('check-username/:username')
  async checkUsernameAvailability(
    @Param('username') username: string,
  ): Promise<{ available: boolean }> {
    const isAvailable = await this.userService.isUsernameAvailable(username);
    return { available: isAvailable };
  }
}
