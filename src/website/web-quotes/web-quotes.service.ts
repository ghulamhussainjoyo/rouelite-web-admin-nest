import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WebQuote, WebQuoteDocument } from './schema/web-quote.schema';
import { CreateWebQuoteDto } from './dto/create-webQuote.dto';

type findQuoteParams = {
  fullName?: string;
  phone?: string;
  address?: string;
  city?: string;
  kiloWatt?: number;
};

@Injectable()
export class WebQuotationsService {
  constructor(
    @InjectModel(WebQuote.name) private readonly webQuoteModel: Model<WebQuote>,
  ) {}

  async createWebQuote(webQuoteDto: CreateWebQuoteDto) {
    const quote = await this.webQuoteModel.create(webQuoteDto);
    return quote;
  }

  async findLeads({
    address,
    city,
    fullName,
    kiloWatt,
    phone,
  }: findQuoteParams): Promise<WebQuoteDocument[]> {
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

    if (kiloWatt) {
      query['kiloWatt'] = kiloWatt;
    }

    if (kiloWatt) {
      query['kiloWatt'] = kiloWatt;
    }

    const bookedSurveys = await this.webQuoteModel.find(query).exec();
    if (!bookedSurveys) {
      throw new NotFoundException();
    }
    return bookedSurveys;
  }
}
