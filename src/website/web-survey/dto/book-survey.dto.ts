import { IsDate, IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator';

export class BookSurveyDto {
  @IsString()
  @IsNotEmpty()
  readonly fullName: string;

  @IsString()
  @IsNotEmpty()
  readonly phone: string;

  @IsString()
  @IsNotEmpty()
  readonly address: string;

  @IsString()
  @IsNotEmpty()
  readonly date: string;

  @IsString()
  @IsNotEmpty()
  readonly time: string;
}
