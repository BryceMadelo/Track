import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';
import { EnvironmentsService } from './environments/environments.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true,
    credentials: true,
  });

  const usersService = app.get(UsersService);
  await usersService.seedAdmin();

  const environmentsService = app.get(EnvironmentsService);
  await environmentsService.seedDefaults();

  await app.listen(3000);
}
bootstrap();
