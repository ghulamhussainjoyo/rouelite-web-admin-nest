import { Injectable, NotFoundException } from '@nestjs/common';
import { WebLead, WebLeadDocument } from './schema/web-lead.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateLeadDto } from './dto/create-lead.dto';

@Injectable()
export class WebLeadService {
  constructor(
    @InjectModel(WebLead.name)
    private readonly webLeadModel: Model<WebLeadDocument>,
  ) {}

  async createWebLead(createLeadDto: CreateLeadDto) {
    const lead = await this.webLeadModel.create(createLeadDto);
    await lead.save();
    return lead;
  }

  async findLeads(
    fullName: string,
    province: string,
    city: string,
    phone: string,
  ): Promise<WebLeadDocument[]> {
    const query = {};
    if (fullName) {
      query['fullName'] = fullName;
    }

    if (province) {
      query['province'] = province;
    }

    if (phone) {
      query['phone'] = phone;
      console.log(query);
    }
    if (city) {
      query['city'] = phone;
      console.log(query);
    }

    const webLeads = await this.webLeadModel.find(query).exec();
    if (!webLeads) {
      throw new NotFoundException();
    }
    return webLeads;
  }

  async countLeads(): Promise<number> {
    return await this.webLeadModel.find().countDocuments();
  }
}
