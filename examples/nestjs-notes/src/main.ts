// Initialize OTel BEFORE NestJS bootstrap
import "./otel";

import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { loggerProvider } from "./otel";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = parseInt(process.env.PORT || "3000", 10);
  await app.listen(port);
  console.log(`NestJS Notes started on port ${port}`);
}

bootstrap();

// Graceful shutdown
process.on("SIGTERM", () => {
  loggerProvider.shutdown().catch(console.error);
});
