import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
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
import { User, UserDocument } from 'src/schema/user.schema';
import { EventService } from './event.service';
import { CreateEventDto } from 'src/dto/create-event.dto';
import { UpdateEventDto } from 'src/dto/update-event.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('event')
export class EventController {
  constructor(private eventService: EventService) {}

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

  @Get('current-user-events')
  async getSignedEvents(@Req() req: Request, @Res() res: Response) {
    const user: UserDocument = req.user as UserDocument;
    const events = await this.eventService.getEventsOfSignedUser(user.id);
    return res.status(HttpStatus.OK).json({ success: true, events: events });
  }

  @Get()
  async getEvents(
    @Query('interest') interest: string,
    @Query('club') campus: string,
    @Query('date') date: string,
    @Res() res: Response,
  ) {
    const events = await this.eventService.getEvents(interest, campus, date);
    return res.status(HttpStatus.OK).json({ success: true, events: events });
  }
}
