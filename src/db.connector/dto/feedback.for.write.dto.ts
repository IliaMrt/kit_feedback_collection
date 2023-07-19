import { PersonalFeedbackDto } from './personal.feedback.dto';

export class FeedbackForWriteDto {
  readonly teacher: string;
  readonly lesson: string;
  readonly className: string;
  readonly lessonDate: string;
  readonly theme: string;

  readonly personalFeedbacks: PersonalFeedbackDto[];
  readonly homework: string;
}
