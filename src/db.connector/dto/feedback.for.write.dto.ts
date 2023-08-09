import { PersonalFeedbackDto } from './personal.feedback.dto';

export class FeedbackForWriteDto {
  form: {
    readonly teacher: string;
    readonly mainLessons: string;
    readonly restLessons: string;
    readonly class: string;
    readonly date: any;
    readonly theme: string;
    readonly homework: string;
  };
  readonly personalFeedbacks: PersonalFeedbackDto[];
}
