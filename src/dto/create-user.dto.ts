import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  IsArray,
  IsEnum,
} from 'class-validator';
import { visibility } from 'src/types/user.enum';

interface IFriendDto {
  date: Date;
  friend: string; // Assuming string for friend ID
}

interface IRequestDto {
  date: Date;
  friend: string; // Assuming string for friend ID
}

interface IBlockedDto {
  date: Date;
  friend: string; // Assuming string for friend ID
}

interface ISocialDto {
  name: string;
  link: string;
  connected: boolean;
}

interface IImage {
  public_id: string;
  url: string;
}

export class CreateUserDto {
  @IsString()
  @MaxLength(30)
  @IsNotEmpty()
  readonly username?: string;

  @IsString()
  @MaxLength(30)
  @IsNotEmpty()
  readonly firstName: string;

  @IsString()
  @MaxLength(30)
  @IsNotEmpty()
  readonly lastName: string;

  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty()
  readonly email: string;

  @IsString()
  @IsNotEmpty()
  readonly password: string;

  @IsString()
  @IsNotEmpty()
  readonly campus: string;

  @IsNotEmpty()
  readonly enrollmentYear: Date;

  @IsArray()
  readonly interest: string[];

  @IsArray()
  readonly friends: IFriendDto[];

  @IsArray()
  readonly requests: IRequestDto[];

  @IsArray()
  readonly blocked: IBlockedDto[];

  readonly image?: string | null;

  @IsArray()
  readonly hosted: string[]; // Assuming string array for event IDs

  @IsArray()
  readonly attended: string[]; // Assuming string array for event IDs

  @IsArray()
  readonly socials: ISocialDto[];

  @IsEnum(visibility)
  @IsNotEmpty()
  readonly accountVisibility: visibility;

  @IsArray()
  readonly notification: string[]; // Assuming string array for notification IDs
}

export class CreateUserPartialDto {
  @IsString()
  @MaxLength(30)
  @IsNotEmpty()
  readonly username?: string;

  @IsString()
  @MaxLength(30)
  @IsNotEmpty()
  readonly firstName: string;

  @IsString()
  @MaxLength(30)
  @IsNotEmpty()
  readonly lastName: string;

  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty()
  readonly email: string;

  @IsString()
  @IsNotEmpty()
  readonly password: string;

  @IsString()
  @IsNotEmpty()
  readonly campus: string;

  @IsNotEmpty()
  readonly enrollmentYear: Date;

  @IsArray()
  readonly interest: string[];
}
