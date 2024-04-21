import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import mongoose, { isValidObjectId, Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateEventDto } from 'src/dto/create-event.dto';
import { User, UserDocument } from 'src/schema/user.schema';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { Event, EventDocument } from 'src/schema/event.schema';
import { UpdateEventDto } from 'src/dto/update-event.dto';
import * as bcrypt from 'bcrypt';
import { Club, ClubDocument } from 'src/schema/club.schema';
import { IUser } from 'src/interface/user.interface';
import { visibility } from 'src/types/event.enum';
import { IEventById } from './interface/eventById';
const saltOrRounds = 10;

@Injectable()
export class EventService {
  constructor(
    @InjectModel(Event.name) private readonly eventModel: Model<EventDocument>,
    @InjectModel(Club.name) private readonly clubModel: Model<ClubDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private cloudinaryService: CloudinaryService,
  ) {}

  //:TODO: REMOVE THIS FUNCTION IN FUTURE
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

    const events = await this.eventModel.find(query).exec();
    if (!events) {
      throw new NotFoundException();
    }
    return events;
  }

  async getEventsByClubId(clubId: string) {
    if (!isValidObjectId(clubId)) {
      throw new BadRequestException('CLUB ID NOT VALID');
    }

    const today = new Date();

    const select = [
      'title',
      'thumbnail',
      'interest',
      'eventDate',
      'startTime',
      'endTime',
      'visibility',
      'description',
    ];
    return new Promise((resolve, reject) => {
      const activePromise = this.eventModel
        .find({
          clubId: clubId,
          eventDate: { $gte: today },
        })
        .select(select);

      const pastPromise = this.eventModel
        .find({
          clubId: clubId,
          eventDate: { $lt: today },
        })
        .select(select);

      Promise.all([activePromise, pastPromise])
        .then(([active, past]) => resolve({ active, past }))
        .catch(reject); // Handle errors in the promise chain
    });
  }

  async getHostedEvents(userId: mongoose.Types.ObjectId) {
    if (!isValidObjectId(userId)) {
      throw new HttpException('USER ID IS NOT VALID', HttpStatus.BAD_REQUEST);
    }
    const today = new Date();
    const selectArr = [
      'title',
      'thumbnail',
      'interest',
      'eventDate',
      'startTime',
      'endTime',
      'visibility',
    ];

    return new Promise((resolve, reject) => {
      const activePromise = this.eventModel
        .find({
          host: userId,
          eventDate: { $gte: today },
        })
        .select(selectArr);

      const pastPromise = this.eventModel
        .find({
          host: userId,
          eventDate: { $lt: today },
        })
        .select(selectArr);
      Promise.all([activePromise, pastPromise])
        .then(([active, past]) => resolve({ active, past }))
        .catch(reject); // Handle errors in the promise chain
    });
  }

  // get events that user has hosted or attending
  async getHostedEventsCount(userId: mongoose.Types.ObjectId): Promise<number> {
    if (!isValidObjectId(userId)) {
      throw new HttpException('USER ID IS NOT VALID', HttpStatus.BAD_REQUEST);
    }
    const count = this.eventModel.countDocuments({
      host: userId,
      eventDate: {
        $gte: new Date(),
      },
    });

    return count;
  }

  // get events that user has joined or attending
  async getAttendingEvents(userId: mongoose.Types.ObjectId) {
    if (!isValidObjectId(userId)) {
      throw new HttpException('USER ID IS NOT VALID', HttpStatus.BAD_REQUEST);
    }
    const today = new Date();

    const selectArr = [
      'title',
      'thumbnail',
      'interest',
      'eventDate',
      'startTime',
      'endTime',
      'visibility',
    ];

    return new Promise((resolve, reject) => {
      const activePromise = this.eventModel
        .find({
          attendance: { $in: [userId] },
          eventDate: { $gte: today },
        })
        .select(selectArr);

      const pastPromise = this.eventModel
        .find({
          attendance: { $in: [userId] },
          eventDate: { $lt: today },
        })
        .select(selectArr);

      Promise.all([activePromise, pastPromise])
        .then(([active, past]) => resolve({ active, past }))
        .catch(reject); // Handle errors in the promise chain
    });
  }

  // get events for logged in user
  // get upcoming events
  // get events that match with user
  async getEventByUser(
    user: IUser,
    page: number,
    limit: number,
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

    const skip = (page - 1) * limit;
    if (!user) {
      throw new NotFoundException('USER NOT FOUND');
    }

    const selectArr = [
      'title',
      'thumbnail',
      'description',
      'eventDate',
      'startTime',
      'endTime',
      'visibility',
      'interest',
    ];
    let events = await this.eventModel
      .find({
        $and: [
          { interest: { $in: user.interest } }, // User's interests
          { eventDate: { $gte: new Date() } }, // Upcoming events
          { host: { $ne: user._id } },
          {
            $nor: [
              { attendance: { $in: [user._id] } },
              { requests: { $in: [user._id] } },
            ],
          },
          { ...query },
        ],
      })

      .select(selectArr)
      .skip(skip)
      .limit(limit)
      .lean();

    if (!events || !events.length) {
      events = await this.eventModel

        .find({
          $and: [
            { eventDate: { $gte: new Date() } }, // Upcoming events
            { host: { $ne: user._id } }, // Exclude events hosted by the user
            {
              $nor: [
                { attendance: { $in: [user._id] } },
                { requests: { $in: [user._id] } },
              ],
            }, // Exclude events where user is attending or requesting
            { ...query }, // Additional filters
          ],
        })

        .select(selectArr)
        .skip(skip)
        .limit(limit)
        .lean();
    }

    if (!events) {
      throw new NotFoundException('EVENTS NOT FOUND');
    }

    return events;
  }

  async getEventById(id: string, user: IUser): Promise<IEventById> {
    if (!isValidObjectId(id)) {
      throw new NotFoundException('ID IS NOT VALID');
    }

    const event = await this.eventModel
      .findById(id)
      .populate({
        path: 'host',
        select: { firstName: 1, lastName: 1, _id: 1 },
      })
      .exec();

    if (!event) {
      throw new NotFoundException('EVENT NOT FOUND');
    }

    const joined = event.attendance?.some(
      (attendant: any) => attendant._id.toString() === user._id.toString(),
    );

    const isHost = (event as any).host._id.toString() === user.id;
    const hasPassword = event.password ? true : false;
    return { ...event.toJSON(), joined, isHost, hasPassword };
  }

  async getEventAttendeesById(
    id: string,
    page = 1,
    limit = 10,
  ): Promise<{ attendance: UserDocument[]; total: number }> {
    if (!isValidObjectId(id)) {
      throw new NotFoundException('ID IS NOT VALID');
    }

    const skip = page <= 0 ? 0 : (page - 1) * limit;

    const [event, count] = await Promise.all([
      this.eventModel
        .findById(id)
        .select('attendance')
        .populate({
          path: 'attendance',
          select: {
            firstName: 1,
            lastName: 1,
            _id: 1,
            image: 1,
            campus: 1,
          },
        })
        .skip(skip)
        .limit(limit)
        .lean(),

      this.eventModel.countDocuments({
        _id: id,
        attendance: { $exists: true, $ne: [] },
      }), // Count only existing attendance
    ]);

    if (!event) {
      throw new NotFoundException('EVENT NOT FOUND');
    }

    // Handle empty attendance case
    return {
      attendance: (event.attendance as UserDocument[]) || [],
      total: count,
    };
  }

  async getJoinedByFriends(user: IUser) {
    if (!user) {
      throw new NotFoundException('USER NOT FOUND');
    }
    const userDB = await this.userModel.findById(user.id);
    // .populate('friends.friend');

    if (!userDB) {
      throw new NotFoundException('USER NOT FOUND');
    }

    const friendIds = user.friends.map((friend) => friend.friend);

    const pipeline = [
      {
        $lookup: {
          from: 'users', // Reference the User collection
          localField: 'attendance', // Field in the Event document referencing User IDs
          foreignField: '_id', // Field in the User collection that holds user IDs
          as: 'joinedByFriends', // Name for the joined results
        },
      },
      {
        $match: {
          joinedByFriends: { $in: friendIds }, // Filter events where joinedByFriends includes friend IDs
        },
      },
      // You can add additional stages here for further filtering or projection
    ];

    const events = await this.eventModel.aggregate(pipeline);
    return events;
  }

  // join event
  async joinEvent(eventId: string, user: IUser): Promise<boolean> {
    if (!isValidObjectId(eventId)) {
      throw new BadRequestException('');
    }
    const event = await this.eventModel.findById(eventId);

    const isRequestFound = event.requests.some(
      (item) => user._id.toString() === item.toString(),
    );

    if (isRequestFound) {
      throw new HttpException('ALREADY EXIST', HttpStatus.CONFLICT);
    }

    const isAttendedFound = event.attendance.some(
      (item) => user._id.toString() === item.toString(),
    );

    if (isAttendedFound) {
      throw new HttpException('ALREADY EXIST', HttpStatus.CONFLICT);
    }

    if (event.visibility === visibility[visibility.private]) {
      event.requests.push(await this.userModel.findById(user.id));
    } else {
      event.attendance.push(await this.userModel.findById(user.id));
    }
    await event.save();
    return true;
  }

  // leave event
  async leaveEvent(eventId: string, user: IUser): Promise<boolean> {
    if (!isValidObjectId(eventId)) {
      throw new BadRequestException('');
    }
    const event = await this.eventModel.findById(eventId);

    const isRequestFound = event.requests.some(
      (item) => user._id.toString() === item.toString(),
    );

    const isAttendedFound = event.attendance.some(
      (item) => user._id.toString() === item.toString(),
    );

    if (!isRequestFound && !isAttendedFound) {
      throw new HttpException('NOT FOUND', HttpStatus.NOT_FOUND);
    }

    if (event.visibility === 'private') {
      event.requests = event.requests.filter(
        (request) => user._id.toString() !== request.toString(),
      );
      event.attendance = event.attendance.filter(
        (request) => user._id.toString() !== request.toString(),
      );
    } else {
      if (isAttendedFound) {
        event.attendance = event.attendance.filter(
          (request) => user._id.toString() !== request.toString(),
        );
      }
    }
    await event.save();
    return true;
  }

  // check event password
  async checkPassword(eventId: string, password: string): Promise<boolean> {
    if (!isValidObjectId(eventId)) {
      throw new HttpException('ID IS NOT VALID', HttpStatus.BAD_REQUEST);
    }
    if (!password) {
      throw new HttpException('PASSWORD NOT FOUND', HttpStatus.NOT_FOUND);
    }
    const event = await this.eventModel.findById(eventId);

    if (!event.password) {
      throw new HttpException(
        'THIS EVENT NOT CONTAIN PASSWORD',
        HttpStatus.NOT_FOUND,
      );
    }
    const result = await bcrypt.compare(password, event.password);

    if (!result) {
      throw new HttpException('INCORRECT PASSWORD', HttpStatus.UNAUTHORIZED);
    }

    return true;
  }

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
      clubId: await this.clubModel.findById(createEventDto.clubId),
      clubName: createEventDto.clubName,
      interest: createEventDto.interest,
      description: createEventDto.description,
      startTime: createEventDto.startTime,
      endTime: createEventDto.endTime,
      title: createEventDto.title,
      eventDate: new Date(createEventDto.eventDate),
      location: createEventDto.location,
      thumbnail: { public_id: result.public_id, url: result.secure_url },
    };

    if (createEventDto?.password) {
      const hashPassword = await bcrypt.hash(
        createEventDto.password,
        saltOrRounds,
      );
      data['password'] = hashPassword;
    }

    const newEvent = await this.eventModel.create(data);
    await newEvent.save();
    return newEvent;
  }

  async updateEvent(id: string, updateEventDto: UpdateEventDto) {
    const existingEvent = await this.eventModel.findByIdAndUpdate(
      id,
      updateEventDto,
      { new: true },
    );

    if (!existingEvent) {
      throw new NotFoundException();
    }

    return existingEvent;
  }

  // ✅: add checked in user
  async checkedInAttendees(
    userId: string,
    eventId: string,
    hostId: string,
  ): Promise<boolean> {
    console.log('🚀 ~ EventService ~ hostId:', hostId);
    //
    if (!isValidObjectId(userId) || !isValidObjectId(eventId)) {
      throw new HttpException('ID NOT IS VALID', HttpStatus.BAD_REQUEST);
    }

    // find event and user either they exist in database or not
    const eventPromise = this.eventModel.findOne({
      host: (await this.userModel.findById(hostId))._id,
      _id: eventId,
    });
    const userPromise = this.userModel.findById(userId);

    const [event, user] = await Promise.all([eventPromise, userPromise]);

    if (!event || !user) {
      throw new NotFoundException('EVENT OR USER NOT FOUND');
    }

    const isAttendedFound = event.attendance.some(
      (item) => item.toString() === userId,
    );

    if (!isAttendedFound) {
      throw new NotFoundException('ATTENDEES NOT FOUND');
    }
    const isCheckedFound = event.checkedIn.some(
      (item) => item.user.toString() === userId,
    );

    if (isCheckedFound) {
      throw new HttpException('USER ALREADY CHECKED IN', HttpStatus.CONFLICT);
    }

    const today = new Date(Date.now());
    event.checkedIn.push({ date: today, user: user.id });
    await event.save();

    return true;
  }
  // ✅: get checked in
  async getCheckedInAttendees(id: string, page = 1, limit = 10) {
    // ✈️
    if (!isValidObjectId(id)) {
      throw new NotFoundException('ID IS NOT VALID');
    }
    const skip = page <= 0 ? 0 : (page - 1) * limit;

    const event = await this.eventModel
      .findById(id)
      .select('checkedIn')
      .populate({
        path: 'checkedIn.user',
        select: {
          firstName: 1,
          lastName: 1,
          _id: 1,
          image: 1,
          campus: 1,
        },
      })
      .skip(skip)
      .limit(limit)
      .lean();

    if (!event) {
      throw new NotFoundException('EVENT NOT FOUND');
    }

    return event;
  }

  // ✅ event pending request (private event)
  async getPendingRequest(id: string, page = 1, limit = 10) {
    // ✈️
    if (!isValidObjectId(id)) {
      throw new NotFoundException('EVENT ID IS NOT VALID');
    }
    const skip = page <= 0 ? 0 : (page - 1) * limit;

    const event = await this.eventModel
      .findById(id)
      .select('requests')
      .populate({
        path: 'requests',
        select: {
          firstName: 1,
          lastName: 1,
          _id: 1,
          image: 1,
          campus: 1,
        },
      })
      .skip(skip)
      .limit(limit)
      .lean();

    if (!event) {
      throw new NotFoundException('EVENT NOT FOUND');
    }

    return event;
  }
  // ✅ accept pending request
  async acceptPendingRequest(userId: string, eventId: string, hostId: string) {
    //
    if (!isValidObjectId(userId) || !isValidObjectId(eventId)) {
      throw new HttpException('ID NOT IS VALID', HttpStatus.BAD_REQUEST);
    }

    // find event and user either they exist in database or not
    const eventPromise = this.eventModel.findOne({
      _id: eventId,
      host: hostId,
    });
    const userPromise = this.userModel.findById(userId);
    const [event, user] = await Promise.all([eventPromise, userPromise]);

    if (!event || !user) {
      throw new NotFoundException();
    }

    const isRequestFound = event.requests.some(
      (item) => item.toString() === userId,
    );

    if (!isRequestFound) {
      throw new NotFoundException(`USER WITH THIS ID ${userId} NOT REQUESTED`);
    }
    event.requests = event.requests.filter((re) => re.toString() !== user.id);
    event.attendance.push(user);
    await event.save();

    return true;
  }

  // ✅ reject pending request
  async rejectPendingRequest(
    userId: string,
    eventId: string,
    hostId: string,
  ): Promise<boolean> {
    //
    if (!isValidObjectId(userId) || !isValidObjectId(eventId)) {
      throw new HttpException('ID NOT IS VALID', HttpStatus.BAD_REQUEST);
    }

    // find event and user either they exist in database or not
    const eventPromise = this.eventModel.findOne({
      _id: eventId,
      host: hostId,
    });
    const userPromise = this.userModel.findById(userId);
    const [event, user] = await Promise.all([eventPromise, userPromise]);

    if (!event || !user) {
      throw new NotFoundException();
    }

    const isRequestFound = event.requests.some(
      (item) => item.toString() === userId,
    );

    if (!isRequestFound) {
      throw new NotFoundException(`USER WITH THIS ID ${userId} NOT REQUESTED`);
    }

    event.requests = event.requests.filter((re) => re.toString() !== user.id);
    await event.save();

    return true;
  }
  // ✅ count pending request
  async countPendingRequest(eventId: string) {
    if (!isValidObjectId(eventId)) {
      throw new HttpException('EVENT ID NOT VALID', HttpStatus.BAD_REQUEST);
    }
    const total = await this.eventModel.countDocuments({
      _id: eventId,
      requests: { $exists: true, $ne: [] },
    });
    return total;
  }

  // ✅ count checked in user
  async countCheckIn(eventId: string) {
    if (!isValidObjectId(eventId)) {
      throw new HttpException('EVENT ID NOT VALID', HttpStatus.BAD_REQUEST);
    }
    const total = await this.eventModel.countDocuments({
      _id: eventId,
      checkedIn: { $exists: true, $ne: [] },
    });
    return total;
  }
}
