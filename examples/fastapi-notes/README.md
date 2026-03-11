# FastAPI Notes — LogClaw Example

A minimal FastAPI app demonstrating OTLP log export to LogClaw.

## Run Locally

```bash
pip install -r requirements.txt

# Set your endpoint (LogClaw Cloud or self-hosted collector)
export OTEL_EXPORTER_OTLP_ENDPOINT=https://otel.logclaw.ai
export OTEL_EXPORTER_OTLP_HEADERS="x-logclaw-api-key=lc_proj_your_key_here"

uvicorn main:app --reload --port 8000
```

Open http://localhost:8000 to use the UI.

## Run with Docker

```bash
docker build -t fastapi-notes .
docker run -p 8000:8000 \
  -e OTEL_EXPORTER_OTLP_ENDPOINT=https://otel.logclaw.ai \
  -e OTEL_EXPORTER_OTLP_HEADERS="x-logclaw-api-key=lc_proj_your_key_here" \
  fastapi-notes
```

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | HTML UI |
| GET | `/api/notes` | List notes |
| POST | `/api/notes` | Create note |
| DELETE | `/api/notes/:id` | Delete note |
| POST | `/api/notes/error` | Simulate error log |
| GET | `/health` | Health check |

## OTel Setup

The OTel logging setup in `main.py` mirrors LogClaw's own production bridge service:

1. Creates a `LoggerProvider` with service name
2. Adds OTLP HTTP exporter (if `OTEL_EXPORTER_OTLP_ENDPOINT` is set)
3. Adds Console exporter (always, for stdout fallback)
4. Instruments Python's `logging` module via `LoggingInstrumentor`

All `logging.info()` / `logging.error()` calls are automatically exported as OTLP log records.
