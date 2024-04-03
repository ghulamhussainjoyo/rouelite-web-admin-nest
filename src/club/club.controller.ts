import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { query, Request, Response } from 'express';
import { ClubIdUserIdDto, CreateClubDto } from 'src/dto/create-club.dto';
import { IUser } from 'src/interface/user.interface';
import { ClubService } from './club.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApproveRequestDto } from 'src/dto/approve-request.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('club')
export class ClubController {
  constructor(private clubService: ClubService) {}

  @Get()
  async getCreatedClubs(@Req() req: Request, @Res() res: Response) {
    const user: IUser = req.user as IUser;
    const clubs = await this.clubService.getCreatedClubs(user);
    return res.status(HttpStatus.OK).json({
      success: true,
      clubs,
    });
  }
  @Get('joined')
  async getJoined(@Req() req: Request, @Res() res: Response) {
    const user: IUser = req.user as IUser;
    const clubs = await this.clubService.getJoinedClubs(user);
    return res.status(HttpStatus.OK).json({
      success: true,
      clubs,
    });
  }

  @Get(':id')
  async getClubById(
    @Req() req: Request,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const user: IUser = req.user as IUser;
    const clubs = await this.clubService.getClubById(id, user);
    return res.status(HttpStatus.OK).json({
      success: true,
      clubs,
    });
  }

  @Get('members/:id')
  async getClubsMember(
    @Req() req: Request,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    // const user: IUser = req.user as IUser;
    const members = await this.clubService.getClubMembers(id);
    return res.status(HttpStatus.OK).json({
      success: true,
      members,
    });
  }

  @Get('requests/:id')
  async getApprovalRequests(
    @Req() req: Request,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const user: IUser = req.user as IUser;
    const requests = await this.clubService.getApproveRequests(id, user);
    return res.status(HttpStatus.OK).json({
      success: true,
      users: requests,
    });
  }

  @Post('create')
  @UseInterceptors(FileInterceptor('file'))
  async createClub(
    @UploadedFile('file') file: Express.Multer.File,
    @Req() req: Request,
    @Body() body: CreateClubDto,
    @Res() res: Response,
  ) {
    const user: IUser = req.user as IUser;
    await this.clubService.createClub(user, file, body);
    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'CLUB CREATED SUCCESSFULLY',
    });
  }
  @Patch('update/:clubId')
  @UseInterceptors(FileInterceptor('file'))
  async updateClub(
    @Param('clubId') clubId: string,
    @UploadedFile('file') file: Express.Multer.File,
    @Req() req: Request,
    @Body() body: CreateClubDto,
    @Res() res: Response,
  ) {
    // const user: IUser = req.user as IUser;
    this.clubService.updateClub(clubId, file, body);
    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'CLUB UPDATED SUCCESSFULLY',
    });
  }

  @Patch('request/join/:id')
  async requestJoinClub(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user: IUser = req.user as IUser;
    await this.clubService.joinClub(id, user);
    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'CLUB JOINED SUCCESSFULLY',
    });
  }

  @Patch('request/approve/:id')
  async approveJoinClub(
    @Param('id') id: string,
    @Req() req: Request,
    @Body() approveRequestDto: ApproveRequestDto,
    @Res() res: Response,
  ) {
    const user: IUser = req.user as IUser;
    await this.clubService.approveRequest(id, approveRequestDto, user);
    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'CLUB JOINED SUCCESSFULLY',
    });
  }

  // query userId:string and clubId:String
  @Get('assign/designation/admin')
  async assignDesignationAdmin(
    @Req() req: Request,
    @Res() res: Response,
    @Query() query: ClubIdUserIdDto,
  ) {
    const { clubId, userId } = query;
    const user: IUser = req.user as IUser;
    const result = await this.clubService.makeAdmin(
      // ->
      clubId,
      userId,
      user,
    );
    if (result) {
      return res.status(HttpStatus.OK).json({
        success: true,
        message: `${userId} IS NOW ADMIN`,
      });
    } else {
      throw new InternalServerErrorException();
    }
  }

  // query userId:string and clubId:String
  @Get('assign/designation/member')
  async assignDesignationMember(
    @Req() req: Request,
    @Res() res: Response,
    @Query() query: ClubIdUserIdDto,
  ) {
    const { clubId, userId } = query;
    const user: IUser = req.user as IUser;

    const result = await this.clubService.assignDesignationMember(
      clubId,
      userId,
      user,
    );
    if (result) {
      return res.status(HttpStatus.OK).json({
        success: true,
        message: `${userId} IS NOW MEMBER`,
      });
    } else {
      throw new InternalServerErrorException();
    }
  }

  // query userId:string and clubId:String
  @Delete('remove/member')
  async removeMember(
    @Req() req: Request,
    @Res() res: Response,
    @Query() query: ClubIdUserIdDto,
  ) {
    const { clubId, userId } = query;
    const user: IUser = req.user as IUser;

    const result = await this.clubService.removeClubMember(
      //
      clubId,
      userId,
    );
    if (result) {
      return res.status(HttpStatus.OK).json({
        success: true,
        message: `${userId} REMOVED`,
      });
    } else {
      throw new InternalServerErrorException();
    }
  }
}
