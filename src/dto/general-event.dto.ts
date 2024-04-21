import { IsNotEmpty, IsString } from 'class-validator';

export class EventPasswordDto {
  @IsString()
  @IsNotEmpty()
  readonly password: string;
}
