import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { BookSurveyService } from './book-survey.service';
import { BookSurveyDto } from './dto/book-survey.dto';

@Controller('website/book-survey')
export class BookedSurveyController {
  constructor(private readonly bookSurvey: BookSurveyService) {}
  @Post()
  async createLead(
    @Req() req: Request,
    @Res() res: Response,
    @Body() bookSurvey: BookSurveyDto,
  ) {
    const bookedSurveys =
      await this.bookSurvey.createSurveyAppointment(bookSurvey);

    if (!bookedSurveys) {
      throw new HttpException(
        'Internal Server',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return res.status(200).json({
      success: true,
      message: 'CREATE SUCCESSFULLY',
    });
  }

  @Get()
  async findBookedSurvey(
    @Query('fullName') fullName: string,
    @Query('phone') phone: string,
    @Query('address') address: string,
    @Query('date') date: string,
    @Query('time') time: string,

    @Req() req: Request,
    @Res() res: Response,
  ) {
    const leads = await this.bookSurvey.findLeads(
      fullName,
      phone,
      address,
      date,
      time,
    );

    return res.status(200).json({
      success: true,
      leads,
    });
  }
}
