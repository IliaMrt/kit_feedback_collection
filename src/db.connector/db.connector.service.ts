import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { FeedbackForWriteDto } from './dto/feedback.for.write.dto';
import { UserDto } from '../auth/dto/user.dto';
import * as process from 'process';

@Injectable()
export class DbConnectorService {
  private async docInit(docUrl: string, sheetName: string | number) {
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const doc = new GoogleSpreadsheet(docUrl, serviceAccountAuth);
    await doc.loadInfo();
    return doc.sheetsByTitle[sheetName];
  }

  async getLessonsByUser(user) {
    console.log('KIT - DbConnector Service - getLessonsByUser at', new Date());

    const sheet = await this.docInit(
      process.env.SCHEDULE_URL,
      process.env.TEACHER_SHEET_NAME,
    );

    const rows = await sheet.getRows();

    await sheet.loadCells({
      startRowIndex: 0,
      endRowIndex: 1,
      startColumnIndex: 0,
      endColumnIndex: rows.length - 1,
    });
    await sheet.loadCells();

    const teacher = await this.getTeacherByEmail(user);

    const lessons = {
      mainLessons: [],
      restLessons: [],
    };

    const mainSet = new Set();
    const restSet = new Set();

    for (let i = 1; i < rows.length - 1; i++) {
      const currentTeacher = sheet.getCell(i, 1).value;
      const currentLesson = sheet.getCell(i, 0).value;
      if (currentTeacher)
        if (currentTeacher == teacher) mainSet.add(currentLesson);
        else restSet.add(currentLesson);
    }

    mainSet.forEach((v) => {
      if (restSet.has(v)) restSet.delete(v);
    });

    lessons.mainLessons = Array.from(mainSet);
    lessons.restLessons = Array.from(restSet);
    return lessons;
  }

  async getTeacherByEmail(user) {
    console.log(
      'KIT - DbConnector Service - Get Teacher By Email at',
      new Date(),
    );

    const sheet = await this.docInit(
      process.env.USERS_LIST_URL,
      process.env.USERS_SHEET_NAME,
    );
    const rows = await sheet.getRows();
    for (const row of rows) {
      if (row.get('email') == user) return row.get('name');
    }
    return null;
  }

  async getClassesByLesson(lessonName) {
    console.log(
      'KIT - DbConnector Service - Get Classes By Lesson at',
      new Date(),
    );

    const sheet = await this.docInit(
      process.env.LESSONS_LIST_URL,
      process.env.LESSON_SHEET_NAME,
    );

    const result = new Set();

    const rows = await sheet.getRows();
    for (const row of rows) {
      if (row.get('Предмет') == lessonName) result.add(row.get('Класс'));
    }

    return Array.from(result);
  }

  async getKidsByClasses(class_name) {
    console.log('KIT - DbConnector Service - getKidsByClasses at', new Date());
    const sheet = await this.docInit(
      process.env.CLASSES_LIST_URL,
      process.env.KIDS_SHEET_NAME,
    );
    const rows = await sheet.getRows();
    if (sheet.headerValues.findIndex((v) => v == class_name) < 0)
      throw new HttpException('Класс не найден', HttpStatus.NOT_FOUND);
    const res = [];
    rows.forEach((row) => {
      if (row.get(class_name))
        // предустанавливаем attended, hard и soft для того, чтобы переключатели были в правильном положении
        res.push({
          id: res.length + 1,
          student: row.get(class_name),
          attended: true,
          hard: true,
          soft: true,
        });
    });
    return res;
  }
  async writeLastVisit(user: string) {
    const sheet = await this.docInit(
      process.env.USERS_LIST_URL,
      process.env.USERS_SHEET_NAME,
    );
    const rows = await sheet.getRows();
    for (const row of rows) {
      if (row.get('name') == user) {
        row.set(
          'lastVisit',
          `${new Date().toLocaleDateString()} в ${new Date().toLocaleTimeString(
            'ru-RU',
          )}`,
        );
        await row.save();
        return;
      }
    }
  }

  async writeFeedBack(feedback: FeedbackForWriteDto, user: string) {
    console.log('KIT - DbConnector Service - writeFeedBack', new Date());

    const teacher = await this.getTeacherByEmail(user);

    await this.writeLastVisit(teacher);

    const sheet = await this.docInit(
      process.env.WRITE_LIST_URL,
      process.env.WRITE_SHEET_NAME,
    );
    const result = [];
    const date = `${new Date().getDate()}/${
      new Date().getMonth() + 1
    }/${new Date().getFullYear()}`;
    const tempDate = new Date(feedback.form.date);
    const lessonDate = `${tempDate.getDate()}/${
      tempDate.getMonth() + 1
    }/${tempDate.getFullYear()}`;
    const time = `${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`;
    feedback.personalFeedbacks.forEach((personal) =>
      result.push({
        teacher: teacher,
        lesson:
          feedback.form.mainLessons == '...'
            ? feedback.form.restLessons
            : feedback.form.mainLessons,
        theme: feedback.form.theme,
        lessonDate: lessonDate,
        className: feedback.form.class,
        student: personal.student,
        hard: personal.hard || false,
        attended: personal.attended || false,
        commentary: personal.commentary,
        soft: personal.soft || false,
        homework: feedback.form.homework,
        date: date,
        time: time,
        createdAt: new Date().toLocaleString(),
      }),
    );
    await sheet.addRows(result);
  }

  async saveUser(user) {
    console.log('KIT - DbConnector Service - Save User at', new Date());

    const sheet = await this.docInit(
      process.env.USERS_LIST_URL,
      process.env.USERS_SHEET_NAME,
    );
    await sheet.addRow(user);
  }

  async findUser(userDto: UserDto) {
    console.log(
      'KIT - DbConnector Service - Find User By Email at',
      new Date(),
    );
    const sheet = await this.docInit(
      process.env.USERS_LIST_URL,
      process.env.USERS_SHEET_NAME,
    );
    const rows = await sheet.getRows();
    for (const row of rows) {
      if (row.get('email') == userDto.email)
        return {
          password: row.get('password'),
          activated: row.get('activated') === 'TRUE',
        };
    }
    return null;
  }

  async findUserByLink(activationLink: string) {
    console.log('KIT - DbConnector Service - Find User By Link at', new Date());

    const sheet = await this.docInit(
      process.env.USERS_LIST_URL,
      process.env.USERS_SHEET_NAME,
    );
    const rows = await sheet.getRows();
    for (const row of rows) {
      if (row.get('activationLink') == activationLink)
        return row.get('email').toString();
    }
    return null;
  }

  async saveActivatedUser(email: string) {
    console.log(
      'KIT - DbConnector Service - Save Activated User at',
      new Date(),
    );

    const sheet = await this.docInit(
      process.env.USERS_LIST_URL,
      process.env.USERS_SHEET_NAME,
    );
    const rows = await sheet.getRows();
    for (let i = 0; i < rows.length; i++) {
      if (rows[i].get('email') == email) {
        await rows[i].set('activated', true);
        await rows[i].save();
        return;
      }
    }
  }

  async deleteUser(email: string) {
    const sheet = await this.docInit(
      process.env.USERS_LIST_URL,
      process.env.USERS_SHEET_NAME,
    );
    const rows = await sheet.getRows();
    for (const row of rows) {
      if (row.get('email') == email) await row.delete();
    }
  }

  async getLastVisit(user) {
    console.log('KIT - DbConnector Service - Get Last Visit at', new Date());
    const userName = await this.getTeacherByEmail(user);
    // console.log(userName);
    const sheet = await this.docInit(
      process.env.USERS_LIST_URL,
      process.env.USERS_SHEET_NAME,
    );
    const rows = await sheet.getRows();

    for (const row of rows) {
      if (row.get('name') == userName)
        return row.get('lastVisit') == '' ? 'не найден' : row.get('lastVisit');
    }

    return 'не найден';
  }
}
