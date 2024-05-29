import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BookSurvey, BookSurveyDocument } from './schema/book-survey.schema';
import { Model } from 'mongoose';
import { BookSurveyDto } from './dto/book-survey.dto';

@Injectable()
export class BookSurveyService {
  constructor(
    @InjectModel(BookSurvey.name)
    private readonly bookSurveyModel: Model<BookSurvey>,
  ) {}

  async createSurveyAppointment(bookSurvey: BookSurveyDto) {
    const survey = await this.bookSurveyModel.create({
      ...bookSurvey,
      date: new Date(bookSurvey.date),
    });
    await survey.save();
    return survey;
  }

  async findLeads(
    fullName?: string,
    phone?: string,
    address?: string,
    date?: string,
    time?: string,
  ): Promise<BookSurveyDocument[]> {
    const query = {};
    if (fullName) {
      query['fullName'] = fullName;
    }

    if (phone) {
      query['phone'] = phone;
    }

    if (phone) {
      query['address'] = phone;
    }
    if (address) {
      query['address'] = address;
    }

    if (date) {
      query['date'] = { $lte: new Date(date) };
    }

    if (time) {
      query['time'] = { $lte: new Date(time) };
    }

    const bookedSurveys = await this.bookSurveyModel.find(query).exec();
    if (!bookedSurveys) {
      throw new NotFoundException();
    }
    return bookedSurveys;
  }
}
