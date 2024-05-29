import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateWebQuoteDto {
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
  readonly city: string;

  @IsString()
  @IsNotEmpty()
  readonly province: string;

  @IsString()
  @IsNotEmpty()
  readonly link: string;

  @IsNumber()
  @IsNotEmpty()
  readonly kiloWatt: number;
}
