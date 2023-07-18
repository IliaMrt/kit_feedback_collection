import { Injectable } from '@nestjs/common';
import { DbConnectorService } from './db.connector/db.connector.service';
import { FullFeedbackDto } from './db.connector/dto/full.feedback.dto';
import { FeedbackForWriteDto } from './db.connector/dto/feedback.for.write.dto';

@Injectable()
export class AppService {
  constructor(private dbConnector: DbConnectorService) {}
  async getHello() {
    return await this.dbConnector.writeFeedBack({
      teacher: 'Маша',
      lesson: 'эРусскийэ',
      className: '1 class',
      personalFeedbacks: [
        {
          student: 'макар',
          activity: true,
          attended: true,
          commentary: 'good boy',
          star: false,
        },
        {
          student: 'иван',
          activity: false,
          attended: false,
          commentary: 'bad boy',
          star: true,
        },
      ],
      homework: 'learn',
    });
  }
}
