import { Module } from '@nestjs/common';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Event, EventSchema } from 'src/schema/event.schema';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { Club, ClubSchema } from 'src/schema/club.schema';
import { User, UserSchema } from 'src/schema/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Event.name, schema: EventSchema },
      { name: Club.name, schema: ClubSchema },
      { name: User.name, schema: UserSchema },
    ]),
    CloudinaryModule,
  ],
  controllers: [EventController],
  providers: [EventService],
})
export class EventModule {}
