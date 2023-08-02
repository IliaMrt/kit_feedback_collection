import { ApiProperty } from '@nestjs/swagger';
import { IsDefined } from 'class-validator';

export class PersonalFeedbackDto {
  @ApiProperty()
  @IsDefined()
  readonly student: string;
  @ApiProperty()
  @IsDefined()

  readonly attended: boolean;
  readonly commentary: string;
  readonly star: boolean;

  readonly activity: boolean;
}
