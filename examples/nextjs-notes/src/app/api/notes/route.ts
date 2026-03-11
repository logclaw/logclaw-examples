/**
 * Notes API — Next.js Route Handlers
 *
 * GET  /api/notes        — List all notes
 * POST /api/notes        — Create a note
 * DELETE /api/notes?id=  — Delete a note
 */

import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { getAllNotes, getNoteCount, createNote, deleteNote } from "@/lib/notes-store";

export async function GET() {
  logger.info("Listing all notes", { note_count: getNoteCount() });
  return NextResponse.json({
    notes: getAllNotes(),
    count: getNoteCount(),
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { title, content = "" } = body;

  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  const note = createNote(title, content);
  logger.info(`Note created: ${title}`, { note_id: note.id });
  return NextResponse.json(note, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }
  const deleted = deleteNote(id);
  if (!deleted) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }
  logger.info(`Note deleted: ${deleted.title}`, { note_id: id });
  return NextResponse.json({ deleted });
}
