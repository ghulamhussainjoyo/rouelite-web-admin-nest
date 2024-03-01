import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { EventModule } from './event.module';
import { InjectModel } from '@nestjs/mongoose';
import { CreateEventDto } from 'src/dto/create-event.dto';
import { User, UserDocument } from 'src/schema/user.schema';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { Event, EventDocument } from 'src/schema/event.schema';
import { subscription } from 'src/types/event.enum';
import { visibility } from 'src/types/user.enum';
import { UpdateEventDto } from 'src/dto/update-event.dto';

@Injectable()
export class EventService {
  constructor(
    @InjectModel(Event.name) private readonly eventModel: Model<EventDocument>,
    private cloudinaryService: CloudinaryService,
  ) {}
  async createEvent(
    file: Express.Multer.File,
    user: UserDocument,
    createEventDto: CreateEventDto,
  ) {
    if (!file) {
      throw new Error('file not found');
    }
    const result = await this.cloudinaryService.uploadImage(file);

    if (!result) {
      throw new InternalServerErrorException();
    }

    const data: Event = {
      host: user.id,
      visibility: createEventDto.visibility as any,
      club: createEventDto.club,
      interest: createEventDto.interest,
      description: createEventDto.description,
      startTime: createEventDto.startTime,
      endTime: createEventDto.endTime,
      title: createEventDto.title,
      eventDate: new Date(createEventDto.eventDate),
      location: createEventDto.location,
      thumbnail: { public_id: result.public_id, url: result.secure_url },
    };

    const newEvent = await this.eventModel.create(data);
    await newEvent.save();
    return newEvent;
  }

  async getEvents(
    interest: string,
    club: string,
    date: string,
  ): Promise<EventDocument[]> {
    const query = {};
    if (interest) {
      query['interest'] = interest;
    }

    if (club) {
      query['club'] = club;
    }

    if (date) {
      query['eventDate'] = { $lte: date };
      console.log(query);
    }

    const events = await this.eventModel
      .find({ eventDate: { $lte: date } })
      .exec();
    if (!events) {
      throw new NotFoundException();
    }
    return events;
  }

  async getEventsOfSignedUser(userId: string): Promise<EventDocument[]> {
    const events = await this.eventModel.find({ host: userId }).exec();
    if (!events) {
      throw new NotFoundException();
    }
    return events;
  }

  async updateEvent(id: string, updateEventDto: UpdateEventDto) {
    console.log(
      '🚀 ~ EventService ~ updateEvent ~ updateEventDto:',
      updateEventDto,
    );
    const existingEvent = await this.eventModel.findByIdAndUpdate(
      id,
      updateEventDto,
      { new: true },
    );
    console.log(
      '🚀 ~ EventService ~ updateEvent ~ existingEvent:',
      existingEvent,
    );

    if (!existingEvent) {
      throw new NotFoundException();
    }

    return existingEvent;
  }
}
