import { Injectable } from '@nestjs/common';
import { DbConnectorService } from './db.connector/db.connector.service';
import { FullFeedbackDto } from './db.connector/dto/full.feedback.dto';
import { FeedbackForWriteDto } from './db.connector/dto/feedback.for.write.dto';

@Injectable()
export class AppService {
  constructor(private dbConnector: DbConnectorService) {}
  async writeFeedback(feedback) {
    console.log('KIT - Main Service - writeFeedback at', new Date());

    return await this.dbConnector.writeFeedBack(feedback)

    /*{
      "teacher": "Маша",
      "lesson": "Русский",
      "className": "1 класс",
      "lessonDate": "12.01.2003",
      "theme": "Дроби",
      "personalFeedbacks": [
        {
          "student": "макар",
          "activity": true,
          "attended": true,
          "commentary": "good boy",
          "star": false,
        },
        {
          "student": "иван",
          "activity": false,
          "attended": false,
          "commentary": "bad boy",
          "star": true,
        },
      ],
      "homework": "learn",
    }*/
  }

  async getLessonsByUser(user) {
    console.log('KIT - Main Service - getLessonsByUser at', new Date());
    return this.dbConnector.getLessonsByUser(user);
  }

  async getKidsByClasses(class_name) {
    console.log('KIT - Main Service - getKidsByClasses at', new Date());
    return this.dbConnector.getKidsByClasses(class_name);
  }
}