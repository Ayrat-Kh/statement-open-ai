import { createZodDto } from '@anatine/zod-nestjs';
import { z, type TypeOf } from 'zod';

const ConfigurationSchema = z.object({
  linkedIn: z.object({
    clientId: z.string().nonempty(),
    clientSecret: z.string().nonempty(),
    callbackUrl: z.string().nonempty(),
  }),
  google: z.object({
    clientId: z.string().nonempty(),
    clientSecret: z.string().nonempty(),
    callbackUrl: z.string().nonempty(),
  }),
  jwt: z.object({
    tokenLifespan: z.string().nonempty(),
    secret: z.string().nonempty(),
  }),
  frontendAuthCallback: z.string().nonempty(),
});

export type Configuration = TypeOf<typeof ConfigurationSchema>;

export class ConfigurationDto extends createZodDto(ConfigurationSchema) {}

export const getConfiguration = () => {
  const configuration: Configuration = {
    linkedIn: {
      clientId: process.env.LINKEDIN_CLIENT_ID as string,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET as string,
      callbackUrl: process.env.LINKEDIN_CLIENT_CALLBACK_URL as string,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackUrl: process.env.GOOGLE_CLIENT_CALLBACK_URL as string,
    },
    jwt: {
      secret: process.env.JWT_SECRET as string,
      tokenLifespan: process.env.JWT_TOKEN_LIFESPAN as string,
    },
    frontendAuthCallback: process.env.FRONTEND_AUTH_CALLBACK as string,
  };

  return ConfigurationSchema.parse(configuration);
};
