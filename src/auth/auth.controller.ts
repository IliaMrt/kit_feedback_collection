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
import { ConfigService } from '@nestjs/config';
import { HttpExceptionFilter } from './http-exception.filter';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { UserDto } from './dto/user.dto';

@Controller('auth')
// @UseFilters(new HttpExceptionFilter())
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private configService: ConfigService,
  ) {}

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
    return response.redirect(this.configService.get('CLIENT_URL'));
  }

  @Post('login')
  @ApiTags('Auth')
  @ApiOperation({ summary: 'Login.' })
  async login(@Body() dto: UserDto) {
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
    return this.authService.registration(req.body, res);
  }

  @Post('logout')
  @ApiTags('Auth')
  @ApiOperation({ summary: 'Logout user.' })
  async logout(data: { refreshToken: string }) {
    console.log('KIT - Auth Controller - logout at', new Date());
    return await this.authService.logout(data.refreshToken);
  }

  @Post('refresh')
  @ApiTags('Auth')
  @ApiOperation({ summary: 'Refresh access token.' })
  async refresh(data: { refreshToken: string }) {
    return await this.authService.refresh(data.refreshToken);
  }

  @Post('activate')
  @ApiTags('Auth')
  @ApiOperation({ summary: 'Activate user account.' })
  async activateUser(data: { activationLink: string }) {
    console.log('KIT - Auth Controller - activate at', new Date());
    return await this.authService.activate(data.activationLink);
  }
}
