import { ApiProperty } from '@nestjs/swagger';

export class PersonalFeedbackDto {
  readonly student: string;
  readonly attended: boolean;
  readonly commentary: string;
  readonly star: boolean;

  readonly activity: boolean;
}
