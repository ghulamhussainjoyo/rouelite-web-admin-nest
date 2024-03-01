import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsDate,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { subscription, visibility } from 'src/types/event.enum';
import { CreateUserDto } from './create-user.dto';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  readonly title: string;

  @IsString()
  @IsNotEmpty()
  readonly description: string;

  @IsString()
  @IsNotEmpty()
  readonly interest: string;

  @IsString()
  @IsNotEmpty()
  readonly eventDate: string;

  @IsString()
  @IsNotEmpty()
  readonly startTime: string;
  @IsString()
  @IsNotEmpty()
  readonly endTime: string;

  @IsString()
  @IsNotEmpty()
  readonly location: string;

  @IsString()
  @IsNotEmpty()
  readonly club: string;

  @IsEnum(subscription)
  @IsNotEmpty()
  readonly subscription?: subscription;

  // @Type(() => CreateUserDto)
  // @ValidateNested({ each: true })
  // @IsArray()
  // readonly host: CreateUserDto;

  @IsEnum(visibility)
  @IsNotEmpty()
  readonly visibility: visibility;

  // @Type(() => CreateUserDto)
  // @ValidateNested({ each: true })
  // @IsArray()
  // readonly attendance: CreateUserDto[];
}
