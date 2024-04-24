import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { CreateUserPartialDto } from 'src/dto/create-user.dto';
import { UpdateUserDto } from 'src/dto/update-user.dto';
import { User, UserDocument } from 'src/schema/user.schema';
import * as bcrypt from 'bcrypt';
const saltOrRounds = 10;

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private cloudinaryService: CloudinaryService,
  ) {}

  async createUser(createUserDto: CreateUserPartialDto) {
    // if (await !this.isEmailValid(createUserDto.email)) {
    //   throw new BadRequestException(
    //     `USER:${createUserDto.username} ALREADY EXISTS`,
    //   );
    // }

    if (!(await this.isUsernameAvailable(createUserDto.username))) {
      throw new ConflictException(
        `this username already exists ${createUserDto.username}`,
      );
    }

    if (!(await this.isEmailAvailable(createUserDto.email))) {
      throw new ConflictException(
        `this email already exists ${createUserDto.email}`,
      );
    }

    const hashPassword = await bcrypt.hash(
      createUserDto.password,
      saltOrRounds,
    );
    const currentUser = {
      ...createUserDto,
      password: hashPassword,
    };

    const newUser = await this.userModel.create(currentUser);
    await newUser.save();
    return [newUser];
  }

  async createUserWithImage(
    file: Express.Multer.File,
    createUserDto: CreateUserPartialDto,
  ) {
    if (!file) {
      throw new Error('file not found');
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
      image: { public_id: result.public_id, url: result.secure_url },
    };

    const newUser = await this.userModel.create(currentUser);
    await newUser.save();
    return [newUser];
  }

  async findById(userId: string): Promise<UserDocument[]> {
    const currentUser = await this.userModel.findById(userId);
    if (!currentUser) {
      throw new NotFoundException(`Student not found with this ${userId}`);
    }
    return [currentUser];
  }

  async findPartialById(userId: string): Promise<UserDocument[]> {
    const currentUser = await this.userModel
      .findById(userId)
      .select(['firstName', 'lastName', 'email', 'image', 'campus']);
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
    const user = await this.userModel.findOne({ username: username }).exec();
    console.log('🚀 ~ UserService ~ isUsernameAvailable ~ user:', user);

    return user ? false : true;
  }

  async isEmailValid(email: string): Promise<boolean> {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@(?:edu|ac\.[a-zA-Z]{2,})$/;
    return emailRegex.test(email);
  }

  async isEmailAvailable(email: string): Promise<boolean> {
    const user = await this.userModel.findOne({ email }).exec();
    return user ? false : true;
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

  async setUsername(id: string, username: string): Promise<UserDocument> {
    if (!(await this.isUsernameAvailable(username))) {
      throw new ConflictException();
    }
    const isUserExist = await this.userModel.findById({ _id: id }).exec();
    if (!isUserExist) {
      throw new NotFoundException();
    }

    const user = await this.userModel
      .findByIdAndUpdate(id, { username: username }, { new: true })
      .exec();

    return user;
  }

  async setUserProfileImage(
    id: string,
    file: Express.Multer.File,
  ): Promise<UserDocument> {
    try {
      if (!file) {
        throw new NotFoundException();
      }
      const user = await this.userModel.findById(id);
      const result = await this.cloudinaryService.uploadImage(file);
      if (!result) {
        throw new InternalServerErrorException();
      }
      user.image = { public_id: result.public_id, url: result.secure_url };
      await user.save();
      return {
        username: user.username,
        campus: user.username,
        email: user.email,
        enrollmentYear: user.enrollmentYear,
        firstName: user.firstName,
        image: user?.image,
        lastName: user.lastName,
        isProfileCompleted: user.isProfileCompleted,
      } as any;
    } catch (error) {
      console.log('🚀 ~ UserService ~ error:', error);
      // throw new Error(error);
    }
  }

  async setUserInterest(id: string, interest: string[]): Promise<UserDocument> {
    if (interest.length <= 0) {
      throw new NotFoundException();
    }
    const user = await this.userModel.findById(id);
    user.interest = interest;
    user.isProfileCompleted = true;
    await user.save();
    return {
      username: user.username,
      campus: user.username,
      email: user.email,
      enrollmentYear: user.enrollmentYear,
      firstName: user.firstName,
      image: user?.image || { public_id: '', url: '' },
      lastName: user.lastName,
      isProfileCompleted: user.isProfileCompleted,
    } as any;
  }

  async getUserFriends(id: string): Promise<number> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException();
    }

    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException(`USER NOT FOUND WITH THIS ID ${id}`);
    }
    const friends = user.friends.length;
    return friends;
  }
}
