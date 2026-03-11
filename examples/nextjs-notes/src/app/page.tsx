"use client";

import { useEffect, useState } from "react";

interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const fetchNotes = async () => {
    const res = await fetch("/api/notes");
    const data = await res.json();
    setNotes(data.notes);
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const createNote = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });
    setTitle("");
    setContent("");
    fetchNotes();
  };

  const simulateError = async () => {
    await fetch("/api/notes/error", { method: "POST" });
    alert("Error log sent!");
  };

  const deleteNote = async (id: string) => {
    await fetch(`/api/notes?id=${id}`, { method: "DELETE" });
    fetchNotes();
  };

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", fontFamily: "system-ui" }}>
      <h1>📝 Next.js Notes</h1>
      <p style={{ color: "#666" }}>
        LogClaw OTel logging example. Logs are sent via OTLP HTTP.
      </p>

      <form onSubmit={createNote} style={{ margin: "20px 0" }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          required
          style={{ width: "100%", padding: 8, margin: "4px 0", boxSizing: "border-box" }}
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Content"
          rows={3}
          style={{ width: "100%", padding: 8, margin: "4px 0", boxSizing: "border-box" }}
        />
        <button type="submit" style={{ padding: "8px 16px", cursor: "pointer" }}>
          Create Note
        </button>
      </form>

      <button
        onClick={simulateError}
        style={{
          padding: "8px 16px",
          background: "#fee",
          border: "1px solid #fcc",
          cursor: "pointer",
          marginBottom: 16,
        }}
      >
        🔴 Simulate Error Log
      </button>

      <h2>Notes</h2>
      {notes.length === 0 ? (
        <p style={{ color: "#999" }}>No notes yet.</p>
      ) : (
        notes.map((note) => (
          <div
            key={note.id}
            style={{
              border: "1px solid #ddd",
              padding: 12,
              margin: "8px 0",
              borderRadius: 8,
            }}
          >
            <strong>{note.title}</strong>
            <p style={{ color: "#666", margin: "4px 0" }}>{note.content}</p>
            <small style={{ color: "#999" }}>
              {note.created_at} — ID: {note.id}
            </small>
            <br />
            <button
              onClick={() => deleteNote(note.id)}
              style={{ color: "red", cursor: "pointer", marginTop: 4 }}
            >
              Delete
            </button>
          </div>
        ))
      )}
    </div>
  );
}
