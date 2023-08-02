import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';
import * as uuid from 'uuid';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { DbConnectorService } from '../db.connector/db.connector.service';
import { TokenService } from '../token/token.service';
import { Response } from 'express';

@Injectable()
export class AuthService {
  private transporter: any;

  constructor(
    private configService: ConfigService,
    private dbConnector: DbConnectorService,
    private tokenService: TokenService,
  ) {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }
  async activate(activationLink: string) {
    console.log('KIT - Auth Service - activateAccount at', new Date());
    console.log(activationLink);
    const email = await this.dbConnector.findUserByLink(activationLink);
    console.log(email);
    if (!email) {
      throw new HttpException( //todo ловить исключения
        'Некорректная ссылка активации',
        HttpStatus.BAD_REQUEST,
      );
    }
    await this.dbConnector.saveActivatedUser(email);
  }
  async registration(dto: UserDto, response: Response) {
    console.log('KIT - Auth Service - registration at', new Date());

    const formattedEmail = dto.email.toLowerCase();

    //const candidate = await this.getUserByEmail(formattedEmail); todo включить проверку
    /*
    if (candidate) {
      //TODO: returns internal server error in response, not good.
      throw new HttpException(
        'Пользователь с таким email уже существует',
        HttpStatus.CONFLICT,
      );
    }
*/

    const hashPassword = await bcrypt.hash(dto.password, 5);

    const user = {
      email: formattedEmail,
      password: hashPassword,
      activationLink: uuid.v4(),
      activated: false,
    };

    await this.sendActivationMail(
      user.email,
      `localhost:3000/auth/activate/${user.activationLink}`,
    );
    await this.dbConnector.saveUser(user);

    const payload = { user: user.email };
    const tokens = this.tokenService.generateTokens(payload);
    response.cookie('refreshToken', tokens.refreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });

    return { user: user, tokens: tokens };
  }

  // Вход в систему, возвращает токены и пользователя
  async login(userDto: UserDto) {
    console.log('KIT - Auth Service - login at', new Date());
    const provider = 'local';
    const password = await this.dbConnector.findUser(userDto);
    //todo добавить проверку
    /*   if (!user) {
      throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
    }*/
    const passwordEquals = await bcrypt.compare(userDto.password, password);
    if (!passwordEquals && provider == 'local') {
      throw new UnauthorizedException({
        message: 'Неверный пароль',
      });
    } //todo ловить исключение
    const payload = await this.generatePayload(userDto);
    const tokens = this.tokenService.generateTokens(payload);
    await this.tokenService.saveToken(userDto.email, tokens.refreshToken);
    return { ...tokens, email: userDto.email };
  }
  async generatePayload(user: UserDto) {
    //todo create USER

    return { user: user.email };
  }
  async sendActivationMail(to, link) {
    console.log('KIT - Auth Service - send activation mail at', new Date());
    let mailSent = false;
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_USER,
        to,
        subject: 'Активация аккаунта Kit Feedback Service',
        text: '',
        html: `
                    <div>
                        <h1>Для активации перейдите по ссылке</h1>
                        <a href="${link}">${link}</a>
                    </div>
                `,
      });
      mailSent = true;
    } catch (e) {
      console.log(`Unable to send activation mail: ${e.message}`);
    }
    return mailSent;
  }

  async logout(refreshToken: string) {
    return Promise.resolve(undefined);
    //todo реализовать метод
  }

  async refresh(refreshToken: string) {
    return Promise.resolve(undefined);
    //todo реализовать метод
  }
}
