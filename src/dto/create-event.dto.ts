import { IsNotEmpty, IsString, IsEnum } from 'class-validator';
import { visibility } from 'src/types/event.enum';

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

  // @IsEnum(subscription)
  // @IsNotEmpty()
  // readonly subscription?: subscription;

  // @Type(() => CreateUserDto)
  // @ValidateNested({ each: true })
  // @IsArray()
  // readonly host: CreateUserDto;

  @IsEnum(visibility)
  @IsNotEmpty()
  readonly visibility: visibility;

  @IsString()
  readonly password?: string;

  // @Type(() => CreateUserDto)
  // @ValidateNested({ each: true })
  // @IsArray()
  // readonly attendance: CreateUserDto[];
}
