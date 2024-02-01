import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { CreateUserPartialDto } from 'src/dto/create-user.dto';
import { UpdateUserDto } from 'src/dto/update-user.dto';
import { User, UserDocument } from 'src/schema/user.schema';
import * as bcrypt from 'bcrypt';
import { url } from 'inspector';
const saltOrRounds = 10;

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private cloudinaryService: CloudinaryService,
  ) {}
  async createUser(
    file: Express.Multer.File,
    createUserDto: CreateUserPartialDto,
  ) {
    if (!file) {
      throw new Error('file not found');
    }

    if (await this.isUsernameAvailable(createUserDto.username)) {
      // throw new ConflictException(
      //   `this username already exists ${createUserDto.username}`,
      // );

      throw new BadRequestException(
        `USER:${createUserDto.username} ALREADY EXISTS`,
      );
    }

    if (await this.isEmailAvailable(createUserDto.email)) {
      throw new ConflictException(
        `this email already exists ${createUserDto.email}`,
      );
    }
    const result = await this.cloudinaryService.uploadImage(file);
    if (!result) {
      throw new InternalServerErrorException();
    }
    const hashPassword = await bcrypt.hash(
      createUserDto.password,
      saltOrRounds,
    );
    const currentUser = {
      ...createUserDto,
      password: hashPassword,
      image: [{ public_id: result.public_id, url: result.secure_url }],
    };
    Logger.log({ currentUser });
    const newUser = await this.userModel.create(currentUser);
    await newUser.save();
    return [newUser];
  }

  async findUser(userId: string): Promise<UserDocument[]> {
    const currentUser = await this.userModel.findById(userId);
    if (!currentUser) {
      throw new NotFoundException(`Student not found with this ${userId}`);
    }
    return [currentUser];
  }

  async getUsers(): Promise<UserDocument[]> {
    const users = await this.userModel.find().exec();
    if (!users || users.length === 0) {
      throw new NotFoundException();
    }
    return users;
  }

  async updateUser(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserDocument> {
    const existingUser = await this.userModel.findByIdAndUpdate(
      userId,
      updateUserDto,
      { new: true },
    );
    if (!existingUser) {
      throw new NotFoundException(`user #${userId} not found`);
    }

    return existingUser;
  }

  async deleteUser(userId: string) {
    const deletedUser = await this.userModel.findByIdAndDelete(userId, {
      new: true,
    });
    if (!deletedUser) {
      throw new NotFoundException(`user #${userId} not found`);
    }
  }

  async isUsernameAvailable(username: string): Promise<boolean> {
    const user = await this.userModel.findOne({ username }).exec();
    return user ? true : false;
  }

  async isEmailAvailable(email: string): Promise<boolean> {
    const user = await this.userModel.findOne({ email }).exec();
    return user ? true : false;
  }

  async isEmailPhoneUsernameAvailable(
    username: string,
    phone: string,
    email: string,
  ): Promise<boolean> {
    // const user = await this.userModel.findOne({ email });
    const user = await this.userModel
      .findOne({
        $or: [{ email: email }, { phone: phone }],
      })
      .exec();
    return !user; // Returns true if username is available, false if already taken
  }
}
