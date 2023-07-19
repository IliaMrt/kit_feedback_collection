import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UseFilters,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { HttpExceptionFilter } from './http-exception.filter';
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Request, Response } from 'express';

@Controller('auth')
@UseFilters(new HttpExceptionFilter())
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('/activate/:link')
  @ApiTags('Auth')
  @ApiOperation({ summary: 'Activate new account.' })
  async activateAccount(
    @Param('link') activationLink: string,
    @Res({ passthrough: true }) response: Response,
  ): Promise<any> {
    console.log('KIT - Auth Controller - activateAccount at', new Date());

    await this.authService.activate(activationLink);
    // this.checkForError(activationResult);
    // todo
    //     return response.redirect(this.configService.get('CLIENT_URL'));
  }
  /* async registration(
    registrationDto: RegistrationDto,
    response: Response,
  ): Promise<any> {*/
  /*   const profileData = await lastValueFrom(
      this.profileProxy.send({ cmd: 'registration' }, { registrationDto }),
    );
    this.checkForError(profileData);*/

  /*
    response.cookie('refreshToken', profileData.tokens.refreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });*/

  /*
    return profileData;
  }*/
  @Post('login')
  @ApiTags('Auth')
  @ApiOperation({ summary: 'Login.' })
  async login(@Body() dto /*: UserDto*/) {
    //todo сделать юзердто
    console.log('KIT - Auth Controller - login at', new Date());

    return await this.authService.login(dto);
  }

  @Post('registration')
  @ApiTags('Auth')
  @ApiOperation({ summary: 'Create/register user.' })
  async registration(
    // @Body() registrationDto: RegistrationDto,
    @Req() req,
    @Res({ passthrough: true }) res: Response,
  ): Promise<any> {
    console.log('KIT - Auth Controller - registration at', new Date());
    // console.log(req);
    return this.authService.registration(req.body, res);
  }

  @Post('logout')
  @ApiTags('Auth')
  async logout(data: { refreshToken: string }) {
    console.log('KIT - Auth Controller - logout at', new Date());

    // todo
    // return await this.authService.logout(data.refreshToken);
  }

  @Post('refresh')
  @ApiTags('Auth')
  async refresh(data: { refreshToken: string }) {
    // return await this.authService.refresh(data.refreshToken);
    // todo
  }

  @Post('activate')
  @ApiTags('Auth')
  async activateUser(data: { activationLink: string }) {
    console.log('KIT - Auth Controller - activate at', new Date());

    return await this.authService.activate(data.activationLink);
  }

  /*
  @MessagePattern({ cmd: 'create  User' })
  @Post()
  async createUser(@Payload() data: { dto: UserDto }): Promise<{
    user: User;
    tokens: { accessToken: string; refreshToken: string };
  }> {
    return await this.usersService.registration(data.dto);
  }
*/

  /*  @MessagePattern({ cmd: 'getUser' })
  async getUser(
    @Payload() data: { email: string; vkId: number; userId: number },
  ) {
    return await this.usersService.getUser(data.email, data.vkId, data.userId);
  }*/
}
