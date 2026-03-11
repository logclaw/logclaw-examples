import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  HttpException,
  HttpStatus,
  Res,
} from "@nestjs/common";
import { Response } from "express";
import { NotesService } from "./notes.service";
import { LoggerService } from "../logger.service";

@Controller()
export class NotesController {
  constructor(
    private readonly notesService: NotesService,
    private readonly logger: LoggerService
  ) {}

  @Get("/")
  getIndex(@Res() res: Response) {
    const notes = this.notesService.findAll().reverse();
    const notesHtml = notes
      .map(
        (n) => `
      <div style="border:1px solid #ddd; padding:12px; margin:8px 0; border-radius:8px;">
        <strong>${n.title}</strong>
        <p style="color:#666; margin:4px 0;">${n.content}</p>
        <small style="color:#999;">${n.created_at} — ID: ${n.id}</small>
      </div>`
      )
      .join("");

    res.send(`<!DOCTYPE html>
<html>
<head><title>NestJS Notes — LogClaw Example</title></head>
<body style="max-width:600px; margin:40px auto; font-family:system-ui;">
  <h1>📝 NestJS Notes</h1>
  <p style="color:#666;">LogClaw OTel logging example. Logs are sent via OTLP HTTP.</p>

  <form id="create-form" style="margin:20px 0;">
    <input name="title" placeholder="Title" required
           style="width:100%; padding:8px; margin:4px 0; box-sizing:border-box;" />
    <textarea name="content" placeholder="Content" rows="3"
              style="width:100%; padding:8px; margin:4px 0; box-sizing:border-box;"></textarea>
    <button type="submit" style="padding:8px 16px; cursor:pointer;">Create Note</button>
  </form>

  <button onclick="fetch('/api/notes/error', {method:'POST'}).then(()=>alert('Error log sent!'))"
          style="padding:8px 16px; background:#fee; border:1px solid #fcc; cursor:pointer; margin-bottom:16px;">
    🔴 Simulate Error Log
  </button>

  <h2>Notes</h2>
  <div>${notesHtml || '<p style="color:#999;">No notes yet.</p>'}</div>

  <script>
  document.getElementById('create-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: form.title.value, content: form.content.value })
    });
    window.location.reload();
  });
  </script>
</body>
</html>`);
  }

  @Get("/api/notes")
  findAll() {
    this.logger.info("Listing all notes", {
      note_count: this.notesService.count(),
    });
    return {
      notes: this.notesService.findAll(),
      count: this.notesService.count(),
    };
  }

  @Post("/api/notes")
  create(@Body() body: { title: string; content?: string }) {
    if (!body.title) {
      throw new HttpException("title is required", HttpStatus.BAD_REQUEST);
    }
    const note = this.notesService.create(body.title, body.content);
    this.logger.info(`Note created: ${note.title}`, { note_id: note.id });
    return note;
  }

  @Post("/api/notes/error")
  simulateError() {
    this.logger.error("Simulated database connection failure", {
      error_type: "ConnectionRefusedError",
      database: "notes-db",
    });
    return {
      status: "error_logged",
      message: "ERROR log sent to LogClaw via OTLP",
    };
  }

  @Delete("/api/notes/:id")
  remove(@Param("id") id: string) {
    const deleted = this.notesService.remove(id);
    if (!deleted) {
      throw new HttpException("Note not found", HttpStatus.NOT_FOUND);
    }
    this.logger.info(`Note deleted: ${deleted.title}`, { note_id: id });
    return { deleted };
  }

  @Get("/health")
  health() {
    return { status: "ok", service: "nestjs-notes" };
  }
}
