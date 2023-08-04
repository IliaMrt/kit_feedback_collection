import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { open } from 'fs/promises';
import { FeedbackForWriteDto } from './dto/feedback.for.write.dto';
import { UserDto } from '../auth/dto/user.dto';

@Injectable()
export class DbConnectorService {
  private teacherSheetName = 'LessonTeacher';
  private kidsSheetName = 'Kids';
  private usersSheetName = 'Users';
  private writeSheetName = 'test';
  private lessonsSheetName = 'LessonTeacher';
  private classesListUrl = '1EXkgWirs0yKL76x9xRMHj0I0OIPiGXxyWps-453DMSI';
  private writeListUrl = '1EXkgWirs0yKL76x9xRMHj0I0OIPiGXxyWps-453DMSI';
  private usersListUrl = '1EXkgWirs0yKL76x9xRMHj0I0OIPiGXxyWps-453DMSI';
  private lessonsListUrl = '1EXkgWirs0yKL76x9xRMHj0I0OIPiGXxyWps-453DMSI';
  private scheduleUrl = '1EXkgWirs0yKL76x9xRMHj0I0OIPiGXxyWps-453DMSI'; //todo change to external source

  private async docInit(docUrl: string, sheetName: string | number) {
    const file = await open(
      '/root/WebstormProjects/kit_feedback_collection/src/db.connector/private_key.json',
      'r',
    );
    const temp = (await file.read()).buffer.toString(); //todo change to JSON
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
    return doc.sheetsByTitle[sheetName];
  }

  async getLessonsByUser(user) {
    console.log('KIT - DbConnector Service - getLessonsByUser at', new Date());
    const sheet = await this.docInit(this.scheduleUrl, this.teacherSheetName);

    await sheet.loadCells('A1:B200'); //todo брать диапазон условно

    const teacher = await this.getTeacherByEmail(user);
    const lessons = {
      mainLessons: [],
      restLessons: [],
    };
    const mainSet = new Set();
    const restSet = new Set();
    for (let i = 1; i < 75; i++) {
      //todo 1 и 76 заменить на количество ячеек
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
      if (row.get(class_name))
        res.push({ id: res.length + 1, student: row.get(class_name) });
    });
    return res;
  }

  async writeFeedBack(feedback: FeedbackForWriteDto, user: string) {
    console.log('KIT - DbConnector Service - writeFeedBack', new Date());

    const teacher = await this.getTeacherByEmail(user);
    console.log(user);
    console.log(teacher);
    const sheet = await this.docInit(this.writeListUrl, this.writeSheetName);
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
        activity: personal.activity || false,
        attended: personal.attended || false,
        commentary: personal.commentary,
        star: personal.star || false,
        homework: feedback.form.homework,
        date: date,
        time: time,
      }),
    );
    console.log(JSON.stringify(result));
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

  async deleteUser(email: string) {
    const sheet = await this.docInit(this.usersListUrl, this.usersSheetName);
    const rows = await sheet.getRows();
    for (const row of rows) {
      if(row.get('email')==email )
        await row.delete()
    }
  }
}
