import { ApiProperty } from '@nestjs/swagger';

export class FeedbackDto {
  readonly attended: boolean;
  readonly commentary:string;
  readonly homework:string;
  readonly star:number;


  @ApiProperty()
  readonly nameRu: string;

  @ApiProperty()
  readonly shortName: string;

  @ApiProperty()
  readonly nameEn: string;
}
