import {
  Body,
  Controller,
  Get,
  HttpStatus,
  InternalServerErrorException,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { UserDocument } from 'src/schema/user.schema';
import { EventService } from './event.service';
import { CreateEventDto } from 'src/dto/create-event.dto';
import { UpdateEventDto } from 'src/dto/update-event.dto';
import { IUser } from 'src/interface/user.interface';
import { EventPasswordDto } from 'src/dto/general-event.dto';
import { ExpRequest } from 'src/auth/middleware/auth.middleware';

@UseGuards(AuthGuard('jwt'))
@Controller('event')
export class EventController {
  constructor(private eventService: EventService) {}

  // create a event

  //TODO: DELETE THIS ROUTE
  @Get()
  async getEvents(
    @Query('interest') interest: string,
    @Query('club') campus: string,
    @Query('date') date: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const events = await this.eventService.getEvents(interest, campus, date);
    return res.status(HttpStatus.OK).json({ success: true, events: events });
  }

  // get hosted events
  @Get('hosted')
  async getHostedEvents(@Req() req: Request, @Res() res: Response) {
    const user: UserDocument = req.user as UserDocument;
    const events = await this.eventService.getHostedEvents(user.id);
    return res.status(HttpStatus.OK).json({ success: true, events: events });
  }

  // get hosted events
  @Get('attending')
  async getAttendingEvents(@Req() req: Request, @Res() res: Response) {
    const user: UserDocument = req.user as UserDocument;
    const events = await this.eventService.getAttendingEvents(user._id);
    return res.status(HttpStatus.OK).json({ success: true, events: events });
  }

  @Get('/user')
  async getEventByUser(
    @Req() req: Request,
    @Res() res: Response,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('interest') interest: string,
    @Query('club') club: string,
    @Query('date') date: string,
  ) {
    try {
      const user: IUser = req.user as IUser;
      const events = await this.eventService.getEventByUser(
        user,
        page,
        limit,
        interest,
        club,
        date,
      );

      return res.status(HttpStatus.OK).json({
        success: true,
        events,
      });
    } catch (error) {
      console.log('🚀 ~ EventController ~ getEventByUser ~ error:', error);
      throw error;
    }
  }

  // get event by club id
  @Get('club/:clubId')
  async getEventsByClubId(
    @Param('clubId') clubId: string,
    @Res() res: Response,
  ) {
    const events = await this.eventService.getEventsByClubId(clubId);
    return res.status(HttpStatus.OK).json({ success: true, events: events });
  }

  @Get('hosted/count')
  async getHostedEventsCount(@Req() req: Request, @Res() res: Response) {
    const user: UserDocument = req.user as UserDocument;
    const count = await this.eventService.getHostedEventsCount(user.id);
    return res.status(HttpStatus.OK).json({ success: true, total: count });
  }

  // get events for logged in user

  // get events that are joined by friends
  @Get('/user/friends')
  async getEventJoinedFriends(@Req() req: Request, @Res() res: Response) {
    try {
      const user = req.user as IUser;
      const events = this.eventService.getJoinedByFriends(user);

      return res.status(HttpStatus.OK).json({
        success: true,
        events,
      });
    } catch (error) {
      throw error;
    }
  }

  // /event/:eventId
  // get event by id

  // /event/attendees/:eventId
  // get events attendees
  @Get('attendees/:id')
  async getEventAttendeesById(
    @Res() res: Response,
    @Param('id') clubId: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    const attendance = await this.eventService.getEventAttendeesById(
      clubId,
      page,
      limit,
    );

    return res.status(HttpStatus.OK).json({ success: true, ...attendance });
  }

  // /event/join/:eventId
  // join event
  @Put('join/:eventId')
  async joinEvent(
    @Param('eventId') eventId: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const user = req.user as IUser;
    const isJoined = await this.eventService.joinEvent(eventId, user);
    if (!isJoined) {
      throw new InternalServerErrorException();
    }
    return res
      .status(HttpStatus.OK)
      .json({ success: true, message: 'REQUEST SENT SUCCESSFULLY' });
  }

  @Put('leave/:eventId')
  async leaveEvent(
    @Param('eventId') eventId: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const user = req.user as IUser;
    const isJoined = await this.eventService.leaveEvent(eventId, user);
    if (!isJoined) {
      throw new InternalServerErrorException();
    }
    return res
      .status(HttpStatus.OK)
      .json({ success: true, message: 'EVENT LEFT SUCCESSFULLY' });
  }

  // /event/check/password
  // check event password
  @Put('/check/password/:eventId')
  async checkEventPassword(
    @Param('eventId') eventId: string,
    @Body() body: EventPasswordDto,
    @Res() res: Response,
  ) {
    console.log('🚀 ~ EventController ~ body:', body);
    await this.eventService.checkPassword(eventId, body.password);

    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'PASSWORD IS CORRECT',
    });
  }
  // ✅ check in attendees
  @Patch('checkIn')
  async checkIn(
    @Res() res: Response,
    @Req() req: ExpRequest,
    @Query('userId') userId: string,
    @Query('eventId') eventId: string,
  ) {
    const hostId = req.user.id;

    const isSuccessful = await this.eventService.checkedInAttendees(
      userId,
      eventId,
      hostId,
    );

    if (!isSuccessful) {
      throw new InternalServerErrorException();
    }

    return res.status(HttpStatus.ACCEPTED).json({
      success: true,
      message: 'USER CHECKED IN SUCCESSFULLY',
    });
  }
  // ✅: get checked in
  @Get('checkIn/:eventId')
  async getCheckedIn(
    @Res() res: Response,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Param('eventId') eventId: string,
  ) {
    const events = await this.eventService.getCheckedInAttendees(
      eventId,
      page,
      limit,
    );
    return res.status(HttpStatus.OK).json({ success: true, events });
  }
  // ✅: reject pending request in
  @Patch('pending/request/reject')
  async rejectPendingRequest(
    @Res() res: Response,
    @Req() req: ExpRequest,
    @Query('userId') userId: string,
    @Query('eventId') eventId: string,
  ) {
    const hostId = req.user.id;
    const isSuccessful = await this.eventService.rejectPendingRequest(
      userId,
      eventId,
      hostId,
    );
    if (!isSuccessful) {
      throw new InternalServerErrorException();
    }
    return res.status(HttpStatus.ACCEPTED).json({
      success: true,
      message: 'PENDING REJECTED SUCCESSFULLY',
    });
  }

  // ✅ accept pending request in
  @Patch('pending/request/accept')
  async acceptPendingRequest(
    @Res() res: Response,
    @Req() req: ExpRequest,
    @Query('userId') userId: string,
    @Query('eventId') eventId: string,
  ) {
    const hostId = req.user.id;

    const isSuccessful = await this.eventService.acceptPendingRequest(
      userId,
      eventId,
      hostId,
    );

    if (!isSuccessful) {
      throw new InternalServerErrorException();
    }

    return res.status(HttpStatus.ACCEPTED).json({
      success: true,
      message: 'PENDING ACCEPTED SUCCESSFULLY',
    });
  }

  // ✅ get pending request
  @Get('pending/request/:eventId')
  async getPendingRequests(
    @Res() res: Response,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Param('eventId') eventId: string,
  ) {
    const events = await this.eventService.getPendingRequest(
      eventId,
      page,
      limit,
    );
    return res.status(HttpStatus.OK).json({ success: true, events });
  }

  // ✅ get pending request
  @Get('pending/request/count/:eventId')
  async countPendingRequests(
    @Res() res: Response,
    @Param('eventId') eventId: string,
  ) {
    const total = await this.eventService.countPendingRequest(eventId);
    return res.status(HttpStatus.OK).json({ success: true, total });
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async createEvent(
    @UploadedFile('file') file: Express.Multer.File,
    @Req() req: Request,
    @Res() res: Response,
    @Body() createEventDto: CreateEventDto,
  ) {
    const user: UserDocument = req.user as UserDocument;
    const event = await this.eventService.createEvent(
      file,
      user,
      createEventDto,
    );
    return res.status(HttpStatus.CREATED).json({
      success: true,
      event,
    });
  }

  // update a event
  @Put(':id')
  async updateEvent(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
    @Res() res: Response,
  ) {
    const updatedEvent = await this.eventService.updateEvent(
      id,
      updateEventDto,
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      events: updatedEvent,
    });
  }
  @Get(':id')
  async getEventById(
    @Param('id') clubId: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const user = req.user as IUser;
    const events = await this.eventService.getEventById(clubId, user);
    return res.status(HttpStatus.OK).json({ success: true, events: events });
  }
}
