# Express Notes — LogClaw Example

A minimal Express app demonstrating OTLP log export to LogClaw.

## Run Locally

```bash
npm install
npm run build

# Set your endpoint
export OTEL_EXPORTER_OTLP_ENDPOINT=https://otel.logclaw.ai
export OTEL_EXPORTER_OTLP_HEADERS="x-logclaw-api-key=lc_proj_your_key_here"

npm start
```

Open http://localhost:3000 to use the UI.

## Run with Docker

```bash
docker build -t express-notes .
docker run -p 3000:3000 \
  -e OTEL_EXPORTER_OTLP_ENDPOINT=https://otel.logclaw.ai \
  -e OTEL_EXPORTER_OTLP_HEADERS="x-logclaw-api-key=lc_proj_your_key_here" \
  express-notes
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

The OTel logger in `src/logger.ts` mirrors LogClaw's own Auth Proxy service:

1. Creates a `LoggerProvider` with service name resource
2. Adds OTLP HTTP exporter (if `OTEL_EXPORTER_OTLP_ENDPOINT` is set)
3. Adds Console exporter (always, for stdout fallback)
4. Exposes `logger.info()`, `logger.warn()`, `logger.error()` helpers

Each call emits a structured OTLP log record with severity, body, and attributes.
