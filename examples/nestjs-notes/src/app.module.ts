import { Module } from "@nestjs/common";
import { NotesController } from "./notes/notes.controller";
import { NotesService } from "./notes/notes.service";
import { LoggerService } from "./logger.service";

@Module({
  controllers: [NotesController],
  providers: [NotesService, LoggerService],
})
export class AppModule {}
