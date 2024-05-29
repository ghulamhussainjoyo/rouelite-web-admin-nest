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
import { CreateLeadDto } from './dto/create-lead.dto';
import { Request, Response } from 'express';
import { WebLeadService } from './web-lead.service';

@Controller('website/web-lead')
export class WebLeadController {
  constructor(private readonly webLeadService: WebLeadService) {}
  @Post()
  async createLead(
    @Req() req: Request,
    @Res() res: Response,
    @Body() createLeadDto: CreateLeadDto,
  ) {
    const createLead = await this.webLeadService.createWebLead(createLeadDto);

    if (!createLead) {
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
  async findLeads(
    @Query('fullName') fullName: string,
    @Query('province') province: string,
    @Query('city') city: string,
    @Query('phone') phone: string,

    @Req() req: Request,
    @Res() res: Response,
  ) {
    const leads = await this.webLeadService.findLeads(
      fullName,
      province,
      city,
      phone,
    );

    return res.status(200).json({
      success: true,
      leads,
    });
  }

  @Get('/count')
  async countLeads(@Res() res: Response) {
    const total = await this.webLeadService.countLeads();
    return res.status(200).json({
      success: true,
      count: total,
    });
  }
}
