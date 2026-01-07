import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { environment } from './environments/environment';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || environment.port;

  await app.listen(port);
}
bootstrap();
