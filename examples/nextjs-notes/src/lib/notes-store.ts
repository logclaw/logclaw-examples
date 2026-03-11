/**
 * In-memory notes store (shared across all API routes).
 * Resets on server restart — this is intentional for a demo app.
 */

export interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

const notes: Map<string, Note> = new Map();
let nextId = 1;

export function getAllNotes(): Note[] {
  return Array.from(notes.values());
}

export function getNoteCount(): number {
  return notes.size;
}

export function createNote(title: string, content: string = ""): Note {
  const id = String(nextId++);
  const note: Note = {
    id,
    title,
    content,
    created_at: new Date().toISOString(),
  };
  notes.set(id, note);
  return note;
}

export function deleteNote(id: string): Note | undefined {
  const note = notes.get(id);
  if (note) {
    notes.delete(id);
  }
  return note;
}
