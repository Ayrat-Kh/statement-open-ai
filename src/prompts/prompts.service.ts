import { Injectable, Logger } from '@nestjs/common';

import { OpenAiClient } from 'src/providers/open-ai-client';
import { DbClient } from 'src/providers/db-client';
import { CreatePromptDto, UserPromptDto } from './prompts.dto';
import { type User } from '@prisma/client';

@Injectable()
export class PromptsService {
  private readonly logger = new Logger('PromptsService');

  constructor(
    private readonly openAiClient: OpenAiClient,
    private readonly dbClient: DbClient,
  ) {}

  public async prompt(
    p: CreatePromptDto,
    user: Pick<User, 'id'>,
  ): Promise<UserPromptDto> {
    const response = await this.openAiClient.chat.completions.create({
      model: 'gpt-4',
      temperature: p.temperature,
      messages: [
        {
          role: 'user',
          content: p.content,
        },
      ],
    });

    this.logger.verbose(
      `Prompted to openAI for user ${user.id}, content ${
        p.content
      }, Usage: ${JSON.stringify(
        response.usage ?? {},
      )}, response: ${JSON.stringify(response.choices)}`,
    );

    const message = response.choices?.[0]?.message?.content ?? '';

    const result = await this.dbClient.userPrompts.create({
      data: {
        prompt: p.content,
        sessionId: response.id,
        userId: user.id,
        responseMessage: message,
      },
    });

    return result;
  }

  public async getUserPrompts(
    user: Pick<User, 'id'>,
  ): Promise<UserPromptDto[]> {
    const userPrompts = await this.dbClient.userPrompts.findMany({
      where: {
        userId: user.id,
      },
    });

    return userPrompts;
  }
}
