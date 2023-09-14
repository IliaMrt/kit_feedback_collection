import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { User } from './auth/Decorator/user';
import { AuthGuard } from './auth/Decorator/auth.guard';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from './auth/Decorator/jwt-auth.guard';

@Controller('kit')
@UseGuards(AuthGuard)
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({
    summary: 'Returns lesson by user.',
    description:
      'Returns an object with the lessons of the current user and the rest of the lessons.',
  })
  @UseGuards(JwtAuthGuard)
  @ApiTags('Main functionality')
  @Get('get-lessons-by-user')
  async getLessonsByTeacher(@User() user) {
    console.log('KIT - Main Controller - getLessonsByUser at', new Date());
    return await this.appService.getLessonsByUser(user.user);
  }

  @Post('write-feedback')
  @UseGuards(JwtAuthGuard)
  @ApiTags('Main functionality')
  async writeFeedback(@Body() feedback, @User() user) {
    return await this.appService.writeFeedback(feedback, user);
  }
  @ApiOperation({
    summary: 'Returns kids by class or group name.',
    description: 'Returns list of kids by class or group name.',
  })
  @ApiParam({
    name: '1 класс',
    required: true,
    description: 'Name of a class or of a group.',
  })
  @ApiTags('Main functionality')
  @UseGuards(JwtAuthGuard)
  @Get('get-kids-by-classes/:class')
  async getKidsByClasses(@Param('class') className) {
    return await this.appService.getKidsByClasses(className);
  }

  @ApiOperation({
    summary: 'Returns name of user.',
    description: 'Returns name of user',
  })
  @ApiTags('Main functionality')
  @UseGuards(JwtAuthGuard)
  @Get('get-user-name')
  async getUserName(@User() user) {
    return await this.appService.getUserName(user.user);
  }

  @ApiOperation({
    summary: 'Returns date and time of last users visit.',
    description: 'Returns date and time of last users visit.',
  })
  @ApiTags('Main functionality')
  @UseGuards(JwtAuthGuard)
  @Get('get-last-visit')
  async getLastVisit(@User() user) {
    return await this.appService.getLastVisit(user.user);
  }

  @ApiTags('Main functionality')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Returns classes by lesson.',
    description: 'Returns classes by lesson name.',
  })
  @ApiParam({
    name: 'Словесность',
    required: true,
    description: 'Name of a lesson.',
  })
  @Get('get-classes-by-lesson/:lesson')
  async getClassesByLesson(@Param('lesson') lessonName) {
    return await this.appService.getClassesByLesson(lessonName);
  }
}
