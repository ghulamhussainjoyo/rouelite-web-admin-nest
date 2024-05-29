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
import { WebQuotationsService } from './web-quotes.service';
import { Response } from 'express';
import { CreateWebQuoteDto } from './dto/create-webQuote.dto';

@Controller('website/web-quotation')
export class WebQuotationsController {
  constructor(private readonly webQuoteService: WebQuotationsService) {}

  @Post()
  async createQuote(
    // @Req() req: Request,
    @Res() res: Response,
    @Body() createQuote: CreateWebQuoteDto,
  ) {
    const result = await this.webQuoteService.createWebQuote(createQuote);

    if (!result) {
      throw new HttpException(
        'QUOTE CREATE ERROR',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'Web Quote Created Successfully',
    });
  }

  @Get()
  async findWebQuotes(
    @Query('fullName') fullName: string,
    @Query('phone') phone: string,
    @Query('address') address: string,
    @Query('city') city: string,
    @Query('kilo-watt') kiloWatt: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const leads = await this.webQuoteService.findLeads({
      fullName,
      phone,
      address,
      kiloWatt,
      city,
    });

    return res.status(200).json({
      success: true,
      leads,
    });
  }
}
