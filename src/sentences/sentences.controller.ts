import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Query,
  Req,
  UsePipes,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ZodValidationPipe } from 'nestjs-zod';

import {
  CreateSentenceEvent,
  SentencesEvents,
} from 'src/events/sentences.event';
import { SentenceDto } from './sentences.dto';
import { UsersService } from 'src/users/users.service';
import { AuthorizedRequest } from 'src/auth/auth.dto';
import { PromptsService } from 'src/prompts/prompts.service';

@Controller('sentences')
export class SentencesController {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly userService: UsersService,
    private readonly promptService: PromptsService,
  ) {}

  @Get()
  async getAllSentences(
    @Req() request: AuthorizedRequest,
    @Query('page') page: string,
    @Query('pageSize') pageSize: string,
  ) {
    let parsedPage = Number(page);
    parsedPage = Number.isNaN(parsedPage) ? parsedPage : 1;

    let parsedPageSize = Number(pageSize);
    parsedPageSize = Number.isNaN(parsedPageSize) ? parsedPageSize : 4;

    return await this.promptService.getUserPrompts({
      user: {
        id: request.user.sub,
      },
      page: parsedPage,
      pageSize: parsedPageSize,
    });
  }

  @Get('/:sentenceId')
  async getSentence(
    @Req() request: AuthorizedRequest,
    @Param('sentenceId') sentenceId: string,
  ) {
    const result = await this.promptService.getUserPrompts({
      user: {
        id: request.user.sub,
      },
      promptId: sentenceId,
    });

    if (!result?.[0]) {
      throw new NotFoundException('Sentence not found');
    }

    return result[0];
  }

  @Post()
  @HttpCode(HttpStatus.NO_CONTENT)
  @UsePipes(ZodValidationPipe)
  async createSentense(
    @Req() request: AuthorizedRequest,
    @Body() sentences: SentenceDto,
  ) {
    const user = await this.userService.getUserById(request.user.sub);

    if (!user) {
      throw new NotFoundException(
        `User with id: ${request.user.sub} does not exist`,
      );
    }

    this.eventEmitter.emit(
      SentencesEvents.CREATE_SENTENCE,
      new CreateSentenceEvent(sentences, user),
    );
  }
}
