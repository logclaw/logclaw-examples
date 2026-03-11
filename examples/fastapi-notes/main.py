"""
FastAPI Notes — LogClaw OTel Logging Example

A minimal notes CRUD app demonstrating how to send structured logs
to LogClaw via OpenTelemetry (OTLP HTTP exporter).

Environment variables:
  OTEL_EXPORTER_OTLP_ENDPOINT  — OTel Collector or LogClaw endpoint
  OTEL_SERVICE_NAME            — Service name (default: fastapi-notes)
"""

import logging
import os
import sys
import uuid
from datetime import datetime, timezone

from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse
from pydantic import BaseModel

# ---------------------------------------------------------------------------
# OTel Logging Setup (mirrors LogClaw Bridge production pattern)
# ---------------------------------------------------------------------------
def _setup_otel_logging():
    try:
        from opentelemetry._logs import set_logger_provider
        from opentelemetry.exporter.otlp.proto.http._log_exporter import OTLPLogExporter
        from opentelemetry.instrumentation.logging import LoggingInstrumentor
        from opentelemetry.sdk._logs import LoggerProvider
        from opentelemetry.sdk._logs.export import (
            BatchLogRecordProcessor,
            ConsoleLogExporter,
        )
        from opentelemetry.sdk.resources import Resource

        resource = Resource.create(
            {"service.name": os.environ.get("OTEL_SERVICE_NAME", "fastapi-notes")}
        )
        provider = LoggerProvider(resource=resource)

        endpoint = os.environ.get("OTEL_EXPORTER_OTLP_ENDPOINT", "")
        if endpoint:
            provider.add_log_record_processor(
                BatchLogRecordProcessor(
                    OTLPLogExporter(endpoint=f"{endpoint}/v1/logs")
                )
            )
        # Always emit to stdout (K8s / Docker log driver fallback)
        provider.add_log_record_processor(
            BatchLogRecordProcessor(ConsoleLogExporter())
        )

        set_logger_provider(provider)
        LoggingInstrumentor().instrument(set_logging_format=True)
    except ImportError:
        pass  # OTel not installed — stdout-only mode


_setup_otel_logging()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    stream=sys.stdout,
)
log = logging.getLogger("fastapi-notes")

# ---------------------------------------------------------------------------
# In-memory Notes Store
# ---------------------------------------------------------------------------
notes_db: dict[str, dict] = {}


class NoteCreate(BaseModel):
    title: str
    content: str = ""


# ---------------------------------------------------------------------------
# FastAPI App
# ---------------------------------------------------------------------------
app = FastAPI(title="FastAPI Notes — LogClaw Example")


@app.get("/", response_class=HTMLResponse)
async def index():
    """Simple HTML UI for creating and listing notes."""
    notes_html = ""
    for nid, note in sorted(notes_db.items(), key=lambda x: x[1]["created_at"], reverse=True):
        notes_html += f"""
        <div style="border:1px solid #ddd; padding:12px; margin:8px 0; border-radius:8px;">
            <strong>{note['title']}</strong>
            <p style="color:#666; margin:4px 0;">{note['content']}</p>
            <small style="color:#999;">{note['created_at']} &mdash; ID: {nid}</small>
            <form method="post" action="/api/notes/{nid}/delete" style="margin-top:4px;">
                <button type="submit" style="color:red; cursor:pointer;">Delete</button>
            </form>
        </div>"""

    return f"""<!DOCTYPE html>
<html>
<head><title>FastAPI Notes — LogClaw Example</title></head>
<body style="max-width:600px; margin:40px auto; font-family:system-ui;">
    <h1>📝 FastAPI Notes</h1>
    <p style="color:#666;">LogClaw OTel logging example. Logs are sent via OTLP HTTP.</p>

    <form id="create-form" style="margin:20px 0;">
        <input name="title" placeholder="Title" required
               style="width:100%; padding:8px; margin:4px 0; box-sizing:border-box;" />
        <textarea name="content" placeholder="Content" rows="3"
                  style="width:100%; padding:8px; margin:4px 0; box-sizing:border-box;"></textarea>
        <button type="submit" style="padding:8px 16px; cursor:pointer;">Create Note</button>
    </form>

    <button onclick="fetch('/api/notes/error', {{method:'POST'}}).then(()=>alert('Error log sent!'))"
            style="padding:8px 16px; background:#fee; border:1px solid #fcc; cursor:pointer; margin-bottom:16px;">
        🔴 Simulate Error Log
    </button>

    <h2>Notes</h2>
    <div id="notes">{notes_html if notes_html else '<p style="color:#999;">No notes yet.</p>'}</div>

    <script>
    document.getElementById('create-form').addEventListener('submit', async (e) => {{
        e.preventDefault();
        const form = e.target;
        const data = {{ title: form.title.value, content: form.content.value }};
        await fetch('/api/notes', {{
            method: 'POST',
            headers: {{ 'Content-Type': 'application/json' }},
            body: JSON.stringify(data)
        }});
        window.location.reload();
    }});
    </script>
</body>
</html>"""


@app.get("/api/notes")
async def list_notes():
    """List all notes."""
    log.info("Listing all notes", extra={"note_count": len(notes_db)})
    return {"notes": list(notes_db.values()), "count": len(notes_db)}


@app.post("/api/notes")
async def create_note(note: NoteCreate):
    """Create a new note."""
    note_id = str(uuid.uuid4())[:8]
    entry = {
        "id": note_id,
        "title": note.title,
        "content": note.content,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    notes_db[note_id] = entry
    log.info("Note created: %s", note.title, extra={"note_id": note_id})
    return entry


@app.post("/api/notes/error")
async def simulate_error():
    """Simulate an error to generate an ERROR log — check LogClaw to see it arrive."""
    log.error(
        "Simulated database connection failure",
        extra={"error_type": "ConnectionRefusedError", "database": "notes-db"},
    )
    return {"status": "error_logged", "message": "ERROR log sent to LogClaw via OTLP"}


@app.delete("/api/notes/{note_id}")
async def delete_note(note_id: str):
    """Delete a note by ID."""
    if note_id not in notes_db:
        raise HTTPException(status_code=404, detail="Note not found")
    deleted = notes_db.pop(note_id)
    log.info("Note deleted: %s", deleted["title"], extra={"note_id": note_id})
    return {"deleted": deleted}


@app.post("/api/notes/{note_id}/delete")
async def delete_note_form(note_id: str):
    """Delete a note (form POST for the HTML UI)."""
    if note_id in notes_db:
        deleted = notes_db.pop(note_id)
        log.info("Note deleted: %s", deleted["title"], extra={"note_id": note_id})
    from fastapi.responses import RedirectResponse
    return RedirectResponse(url="/", status_code=303)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "fastapi-notes"}
