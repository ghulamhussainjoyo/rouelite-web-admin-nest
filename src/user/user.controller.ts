import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Put,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';

@UseGuards(AuthGuard('jwt'))
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // TODO: set user name
  @Put('set-username/:username')
  async setUserName(
    @Param('username') username: string,
    @Res() res: Response,
    @Req() req: any,
  ) {
    const id = req.user.id;
    const user = await this.userService.setUsername(id, username);
    return res
      .status(HttpStatus.OK)
      .json({ screen: true, message: `USER.USERPROFILE_UPDATED_SUCCESSFULLY` });
  }
  // TODO: set profile picture

  @Put('set-user-profile-image')
  @UseInterceptors(FileInterceptor('file'))
  async setUserProfile(
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
    @Req() req: any,
  ) {
    const id = req.user.id;
    const user = await this.userService.setUserProfile(id, file);
    return res.status(HttpStatus.OK).json({ success: true, user });
  }
  // TODO: set user interest
  @Put('set-user-interest')
  async setUserInterest(
    @Body() body: { interest: string[] },
    @Res() res: Response,
    @Req() req: any,
  ) {
    const id = req.user.id;
    const user = await this.userService.setUserInterest(id, body.interest);
    return res.status(HttpStatus.OK).json({
      user,
      success: true,
      message: `USER.INTEREST_UPDATED_SUCCESSFULLY`,
    });
  }
}
