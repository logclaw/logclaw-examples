/**
 * Express Notes — LogClaw OTel Logging Example
 *
 * A minimal notes CRUD app demonstrating how to send structured logs
 * to LogClaw via OpenTelemetry (OTLP HTTP exporter).
 */

import express from "express";
import { logger, shutdownLogger } from "./logger";

const app = express();
app.use(express.json());

// ---------------------------------------------------------------------------
// In-memory Notes Store
// ---------------------------------------------------------------------------
interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

const notes: Map<string, Note> = new Map();
let nextId = 1;

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

app.get("/", (_req, res) => {
  const notesList = Array.from(notes.values()).reverse();
  const notesHtml = notesList
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
<head><title>Express Notes — LogClaw Example</title></head>
<body style="max-width:600px; margin:40px auto; font-family:system-ui;">
  <h1>📝 Express Notes</h1>
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
});

app.get("/api/notes", (_req, res) => {
  logger.info("Listing all notes", { note_count: notes.size });
  res.json({ notes: Array.from(notes.values()), count: notes.size });
});

app.post("/api/notes", (req, res) => {
  const { title, content = "" } = req.body;
  if (!title) {
    res.status(400).json({ error: "title is required" });
    return;
  }
  const id = String(nextId++);
  const note: Note = {
    id,
    title,
    content,
    created_at: new Date().toISOString(),
  };
  notes.set(id, note);
  logger.info(`Note created: ${title}`, { note_id: id });
  res.status(201).json(note);
});

app.post("/api/notes/error", (_req, res) => {
  logger.error("Simulated database connection failure", {
    error_type: "ConnectionRefusedError",
    database: "notes-db",
  });
  res.json({
    status: "error_logged",
    message: "ERROR log sent to LogClaw via OTLP",
  });
});

app.delete("/api/notes/:id", (req, res) => {
  const note = notes.get(req.params.id);
  if (!note) {
    res.status(404).json({ error: "Note not found" });
    return;
  }
  notes.delete(req.params.id);
  logger.info(`Note deleted: ${note.title}`, { note_id: req.params.id });
  res.json({ deleted: note });
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "express-notes" });
});

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------
const PORT = parseInt(process.env.PORT || "3000", 10);
const server = app.listen(PORT, () => {
  logger.info(`Express Notes started on port ${PORT}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  server.close(() => {
    shutdownLogger().catch(console.error);
  });
});
