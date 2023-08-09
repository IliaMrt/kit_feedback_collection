import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsEmail, IsString, Length } from 'class-validator';

export class RegistrationDto {
  @ApiProperty()
  @IsDefined()
  @IsString()
  @Length(5, 20)
  readonly password: string;

  @ApiProperty()
  @IsDefined()
  @IsEmail()
  readonly email: string;
}
