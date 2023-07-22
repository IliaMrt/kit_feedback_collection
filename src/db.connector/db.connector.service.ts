import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { open } from 'fs/promises';
import { FeedbackForWriteDto } from './dto/feedback.for.write.dto';
import { UserDto } from '../auth/dto/user.dto';

@Injectable()
export class DbConnectorService {
  private teacherSheetName = 'Список уроков, педагогов и классов';
  private kidsSheetName = 'Kids';
  private usersSheetName = 'Users';
  private writeSheetName = 'test';
  private lessonsSheetName = 'LessonTeacher';
  private classesListUrl = '1EXkgWirs0yKL76x9xRMHj0I0OIPiGXxyWps-453DMSI';
  private writeListUrl = '1EXkgWirs0yKL76x9xRMHj0I0OIPiGXxyWps-453DMSI';
  private usersListUrl = '1EXkgWirs0yKL76x9xRMHj0I0OIPiGXxyWps-453DMSI';
  private lessonsListUrl = '1EXkgWirs0yKL76x9xRMHj0I0OIPiGXxyWps-453DMSI';
  private scheduleUrl = '1JlCuXUp9KymE9mh2qKahPQjmmoo1zOPb2VXNKe-JpQU'; //todo change to external source

  private async docInit(docUrl: string, sheetName: string | number) {
    const file = await open(
      '/root/WebstormProjects/kit_feedback_collection/src/db.connector/private_key.json',
      'r',
    );
    const temp = (await file.read()).buffer.toString(); //todo change to JSON
    // console.log(temp); //todo переделать на JSON
    const data = temp; //JSON.parse(temp);
    const key = data; //.private_key;
    await file.close();

    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const doc = new GoogleSpreadsheet(docUrl, serviceAccountAuth);
    await doc.loadInfo();
    const sheet = doc.sheetsByTitle[sheetName];
    return sheet;
  }

  async getLessonsByUser(user) {
    console.log('KIT - DbConnector Service - getLessonsByUser at', new Date());

    const sheet = await this.docInit(this.scheduleUrl, this.teacherSheetName);

    await sheet.loadCells('A1:B200');
    const a1 = sheet.getCell(0, 0); // access cells using a zero-based index

    const teacher = await this.getTeacherByEmail(user);
    const lessons = {
      mainLessons: [],
      restLessons: [],
    };

    for (let i = 1; i < 75; i++) {
      //todo 1 и 76 заменить на количество ячеек
      const currentTeacher = sheet.getCell(i, 1).value;
      const currentLesson = sheet.getCell(i, 0).value;

      if (currentTeacher == teacher) lessons.mainLessons.push(currentLesson);
      else lessons.restLessons.push(currentLesson);

      // const lessonsByCurrentTeacher = teaherLessonObj.get(currentTeacher);

      /*      if (!teaherLessonObj.has(currentTeacher)) {
        teaherLessonObj.set(currentTeacher, [currentLesson]);
      } else {
        lessonsByCurrentTeacher.push(currentLesson);
        teaherLessonObj.set(currentTeacher, lessonsByCurrentTeacher);
      }*/
    }
    // console.log(JSON.stringify(lessons));
    return lessons;
    // const rows = await sheet.getRows();
    // console.log(rows[0].get('Педагоги'));
  }

  private async getTeacherByEmail(user) {
    console.log(
      'KIT - DbConnector Service - Get Teacher By Email at',
      new Date(),
    );

    const sheet = await this.docInit(this.usersListUrl, this.usersSheetName);
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
      this.lessonsListUrl,
      this.lessonsSheetName,
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
    const sheet = await this.docInit(this.classesListUrl, this.kidsSheetName);
    const rows = await sheet.getRows();
    if (sheet.headerValues.findIndex((v) => v == class_name) < 0)
      throw new HttpException('Класс не найден', HttpStatus.NOT_FOUND); //todo ловить исключения
    const res = [];
    rows.forEach((row) => {
      if (row.get(class_name) != null)
        res.push({ id: res.length + 1, name: row.get(class_name) });
    });
    return res;
  }

  async writeFeedBack(feedback: FeedbackForWriteDto) {
    console.log('KIT - DbConnector Service - writeFeedBack', new Date());

    const sheet = await this.docInit(this.writeListUrl, this.writeSheetName);
    const result = [];
    const date = `${new Date().getDate()}/${
      new Date().getMonth() + 1
    }/${new Date().getFullYear()}`;
    const time = `${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`;
    feedback.personalFeedbacks.forEach((personal) =>
      result.push({
        teacher: feedback.teacher,
        lesson: feedback.lesson,
        theme: feedback.theme,
        lessonDate: feedback.lessonDate,
        className: feedback.className,
        student: personal.student,
        activity: personal.activity,
        attended: personal.attended,
        commentary: personal.commentary,
        star: personal.star,
        homework: feedback.homework,
        date: date,
        time: time,
      }),
    );

    await sheet.addRows(result);
  }

  async saveUser(user /*: User*/) {
    console.log('KIT - DbConnector Service - Save User at', new Date());

    const sheet = await this.docInit(this.usersListUrl, this.usersSheetName);
    await sheet.addRow(user);
  } //todo create USER

  async findUser(userDto: UserDto) {
    console.log(
      'KIT - DbConnector Service - Find User By Email at',
      new Date(),
    );

    const sheet = await this.docInit(this.usersListUrl, this.usersSheetName);
    const rows = await sheet.getRows();
    for (const row of rows) {
      if (row.get('email') == userDto.email) return row.get('password');
    }
    return null;
  }

  async findUserByLink(activationLink: string) {
    console.log('KIT - DbConnector Service - Find User By Link at', new Date());

    const sheet = await this.docInit(this.usersListUrl, this.usersSheetName);
    const rows = await sheet.getRows();
    for (const row of rows) {
      if (row.get('activationLink') == activationLink) return row.get('email');
    }
    return null;
  }

  async saveActivatedUser(email: string) {
    console.log(
      'KIT - DbConnector Service - Save Activated User at',
      new Date(),
    );

    const sheet = await this.docInit(this.usersListUrl, this.usersSheetName);
    const rows = await sheet.getRows();
    for (let i = 0; i < rows.length; i++) {
      if (rows[i].get('email') == email) {
        await rows[i].set('activated', true); // = true;
        await rows[i].save();
        return;
      }
    }
  }
}
