import { IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator';

export class CreateLeadDto {
  @IsString()
  @IsNotEmpty()
  readonly fullName: string;

  @IsString()
  @IsPhoneNumber('PK')
  readonly phone: string;

  @IsString()
  @IsNotEmpty()
  readonly province: string;

  @IsString()
  @IsNotEmpty()
  readonly city: string;
}
