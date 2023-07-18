import { PersonalFeedbackDto } from './personal.feedback.dto';

export class FullFeedbackDto {
  readonly teacher: string;
  readonly lesson: string;
  readonly className: string;
  readonly personalFeedbacks: [PersonalFeedbackDto];
  readonly homework: string;
}
