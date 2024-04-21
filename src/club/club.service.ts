import {
  BadGatewayException,
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { ApproveRequestDto } from 'src/dto/approve-request.dto';
import { CreateClubDto, UpdateClubDto } from 'src/dto/create-club.dto';
// import { InValidIdException } from 'src/exception/InvalidIdException';
import { InValidIdException } from '../exception/InValidIdException';
import { IClub } from 'src/interface/club.interface';
import { IUser } from 'src/interface/user.interface';
import { Club, ClubDocument } from 'src/schema/club.schema';
import { User, UserDocument } from 'src/schema/user.schema';
import { designation, memberStatus } from 'src/types/club.enum';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

function isValidObjectId(id: string): boolean {
  return objectIdRegex.test(id);
}

@Injectable()
export class ClubService {
  constructor(
    @InjectModel(Club.name)
    private readonly clubModel: Model<ClubDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async getCreatedByUser(user: IUser): Promise<ClubDocument[]> {
    if (!user) {
      throw new NotFoundException();
    }
    const clubs = await this.clubModel.find({ owner: user._id }).exec();
    return clubs;
  }

  async getJoinedClubs(user: IUser): Promise<ClubDocument[]> {
    if (!user) {
      throw new NotFoundException();
    }
    const clubs = await this.clubModel
      .find({ 'members.user': user._id, 'members.designation': 'member' })
      .exec();
    return clubs;
  }

  async getClubById(
    clubId: string,
    user: IUser,
  ): Promise<IClub & { isOwner: boolean; isAdmin: boolean }> {
    if (!isValidObjectId(clubId)) {
      throw new HttpException('INVALID CLUB ID', HttpStatus.BAD_REQUEST);
    }
    if (clubId.length <= 0) {
      throw new Error('CLUB ID NOT FOUND');
    }
    const club = await this.clubModel.findOne({ _id: clubId }).exec();

    if (!club) {
      throw new NotFoundException();
    }

    if (!user) {
      throw new NotFoundException('USER NOT FOUND');
    }

    const member = club.members.find((member) => member.user === user.id);

    let status = memberStatus[memberStatus.UNCONNECTED];

    if (member) {
      status = memberStatus[memberStatus.JOINED];
    } else if (club.requests.includes(user.id)) {
      status = memberStatus[memberStatus.REQUESTED];
    }

    const isOwner = club.owner.valueOf() === user._id.valueOf();
    const isAdmin: boolean = club.members.some(
      (us) =>
        user._id.valueOf() === us.user.valueOf() &&
        us.designation === designation[designation.admin],
    );

    return { ...club.toJSON(), status, isOwner, isAdmin };
  }

  async getClubMembers(clubId: string) {
    if (!clubId) {
      throw new Error('CLOUD ID NOT FOUND');
    }
    const club = await this.clubModel
      .findById(clubId)
      .populate('members.user')
      .exec();

    if (!club) {
      throw new Error('CLUB NOT FOUND');
    }

    const members = club.members.map((member) => ({
      designation: member.designation as any,
      user: member.user,
    }));

    return members;
  }

  async getApproveRequests(clubId: string, user: IUser) {
    try {
      if (!clubId) {
        throw new Error('CLOUD ID NOT FOUND');
      }
      const requests = await this.clubModel
        .findOne({ _id: clubId, owner: user._id })
        .select('requests')
        .populate('requests', {
          firstName: true,
          lastName: true,
          username: true,
        })
        .exec();

      if (!requests) {
        throw new Error('CLUB NOT FOUND');
      }
      return requests;
    } catch (error) {
      if (error.name === 'CastError') {
        throw new NotFoundException('Invalid club ID'); // Customize message
      } else {
        // Handle other errors (e.g., database errors)
        throw new InternalServerErrorException('An error occurred');
      }
    }
  }

  async createClub(
    user: IUser,
    file: Express.Multer.File,
    body: CreateClubDto,
  ): Promise<ClubDocument> {
    try {
      if (!file) {
        throw new NotFoundException('File Not Found');
      }

      const cloudinaryResult = await this.cloudinaryService.uploadImage(file);

      if (!cloudinaryResult) {
        throw new InternalServerErrorException();
      }

      const data: Club = {
        name: body.name,
        description: body.description,
        interest: body.interest,
        thumbnail: {
          public_id: cloudinaryResult.public_id,
          url: cloudinaryResult.secure_url,
        },
        owner: user.id,
        members: [
          {
            designation: designation.owner,
            user: await user.id,
          },
        ],
      };
      const newClub = await this.clubModel.create(data);
      // newClub.members.push({ designation: designation.owner, user: user.id });
      await newClub.save();
      if (!newClub) {
        throw new InternalServerErrorException();
      }

      return newClub;
    } catch (error) {
      console.log('🚀 ~ ClubService ~ error:', error);
      throw new InternalServerErrorException(error);
    }
  }

  // TODO:test
  async updateClub(
    clubId: string,
    file: Express.Multer.File,
    body: UpdateClubDto,
  ): Promise<ClubDocument> {
    // Validate the clubId
    if (!isValidObjectId(clubId)) {
      throw new BadRequestException();
    }

    // Find the club
    const club = await this.clubModel.findByIdAndUpdate(
      clubId,
      { ...body },
      { new: true },
    );

    if (!club) {
      throw new NotFoundException();
    }

    // If a file is provided, upload it and update the club's thumbnail
    if (file) {
      const cloudinaryResult = await this.cloudinaryService.uploadImage(file);
      if (!cloudinaryResult) {
        throw new InternalServerErrorException();
      }
      // club.thumbnail.public_id = cloudinaryResult.public_id;
      // club.thumbnail.url = cloudinaryResult.secure_url;

      club.thumbnail[0] = {
        public_id: cloudinaryResult.public_id,
        url: cloudinaryResult.secure_url,
      };
    }

    await club.save();
    return club;
  }

  async joinClub(clubId: string, user: IUser): Promise<boolean> {
    if (!clubId) {
      throw new Error('CLUB ID NOT FOUND');
    }
    const club = await this.clubModel
      .findOne({ _id: clubId })
      .populate('owner', { username: true })
      .exec();

    if (!club) {
      throw new Error('CLUB NOT FOUND');
    }

    if (club.owner.username === user.username) {
      throw new BadGatewayException();
    }
    // Push user's ObjectId into the requests array
    club.requests.push(user.id); // Assuming user._id contains the ObjectId of the user
    // Save the updated club document
    await club.save();

    return true;
  }

  async approveRequest(
    clubId: string,
    approveUserDro: ApproveRequestDto,
    user: IUser,
  ) {
    if (!isValidObjectId(clubId)) {
      throw new BadRequestException('Invalid club ID format');
    }

    try {
      const request = await this.clubModel
        .findOne({
          _id: clubId,
          owner: user._id,
        })
        .populate('requests', {
          firstName: true,
          lastName: true,
          username: true,
        })
        .exec();

      if (!request) {
        throw new NotFoundException('Club not found or request not found');
      }

      const requestIndex = request.requests.findIndex(
        (item) => (item as any).id === approveUserDro.userId,
      );

      if (requestIndex <= -1) {
        throw new NotFoundException();
      }

      request.members.push({
        designation: designation[designation.member],
        user: await this.userModel.findById(approveUserDro.userId),
      });
      request.requests.splice(requestIndex, 1);
      request.save();

      return request; // Process the approved request
    } catch (error) {
      if (error.name === 'CastError') {
        throw new NotFoundException('Invalid club ID'); // Customize message
      } else {
        // Handle other errors (e.g., database errors)
        throw new InternalServerErrorException('An error occurred');
      }
    }
  }

  async makeAdmin(
    clubId: string,
    userId: string,
    user: IUser,
  ): Promise<boolean> {
    if (!isValidObjectId(clubId) || !isValidObjectId(userId)) {
      throw new InValidIdException();
    }
    const [clubDB] = await Promise.all([
      this.clubModel.findOne({
        _id: clubId,
        owner: user.id,
      }),
    ]);

    if (!clubDB) {
      throw new NotFoundException();
    }
    const memberIndex = clubDB.members.findIndex(
      (user) =>
        String(user.user) === String(userId) &&
        user.designation === designation[designation.member],
    );

    if (memberIndex <= -1) {
      throw new NotFoundException();
    }

    clubDB.members[memberIndex].designation = designation.admin;
    await clubDB.save();
    return true;
  }

  async assignDesignationMember(
    clubId: string,
    userId: string,
    user: IUser,
  ): Promise<boolean> {
    if (!isValidObjectId(clubId) || !isValidObjectId(userId)) {
      throw new InValidIdException();
    }
    const [clubDB] = await Promise.all([
      this.clubModel.findOne({
        _id: clubId,
        owner: user.id,
      }),
    ]);

    if (!clubDB) {
      throw new NotFoundException();
    }
    const memberIndex = clubDB.members.findIndex(
      (user) =>
        String(user.user) === String(userId) &&
        user.designation === designation[designation.admin],
    );

    if (memberIndex <= -1) throw new NotFoundException();

    clubDB.members[memberIndex].designation = designation.member;
    await clubDB.save();
    return true;
  }

  async removeClubMember(clubId: string, userId: string): Promise<boolean> {
    //
    if (!isValidObjectId(clubId) || !isValidObjectId(userId)) {
      throw new BadRequestException();
    }
    const clubFromDB = await this.clubModel.findById(clubId);

    if (!clubFromDB) throw new NotFoundException();

    const isAdmin = clubFromDB.members.some(
      (item) => item.designation === designation[designation.admin],
    );

    if (isAdmin) throw new UnauthorizedException();

    clubFromDB.members = clubFromDB.members.filter(
      (user) => String(user.user) !== userId,
    );

    await clubFromDB.save();

    return true;
  }

  // ->
  async getClubsForUser(user: IUser): Promise<ClubDocument[]> {
    if (!user) {
      throw new NotFoundException();
    }
    const selectArray = ['thumbnail', 'name', '_id', ''];
    let clubs = await this.clubModel
      .find({
        $and: [
          { interest: { $in: user.interest } }, // User's interests
          { owner: { $ne: user._id } },
          {
            $nor: [
              { members: { $in: [user._id] } },
              { requests: { $in: [user._id] } },
            ],
          },
        ],
      })
      .select(selectArray)
      .exec();

    if (!clubs || !clubs.length) {
      clubs = await this.clubModel
        .find({
          $and: [
            { owner: { $ne: user._id } },
            {
              $nor: [
                { members: { $in: [user._id] } },
                { requests: { $in: [user._id] } },
              ],
            },
          ],
        })
        .select(selectArray)
        .exec();
    }
    return clubs;
  }
}
