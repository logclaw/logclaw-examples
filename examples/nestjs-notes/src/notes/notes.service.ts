import { Injectable } from "@nestjs/common";

export interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

@Injectable()
export class NotesService {
  private notes: Map<string, Note> = new Map();
  private nextId = 1;

  findAll(): Note[] {
    return Array.from(this.notes.values());
  }

  create(title: string, content: string = ""): Note {
    const id = String(this.nextId++);
    const note: Note = {
      id,
      title,
      content,
      created_at: new Date().toISOString(),
    };
    this.notes.set(id, note);
    return note;
  }

  findOne(id: string): Note | undefined {
    return this.notes.get(id);
  }

  remove(id: string): Note | undefined {
    const note = this.notes.get(id);
    if (note) {
      this.notes.delete(id);
    }
    return note;
  }

  count(): number {
    return this.notes.size;
  }
}
