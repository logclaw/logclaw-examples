# NestJS Notes — LogClaw Example

A minimal NestJS app demonstrating OTLP log export to LogClaw.

## Run Locally

```bash
npm install

# Set your endpoint
export OTEL_EXPORTER_OTLP_ENDPOINT=https://otel.logclaw.ai
export OTEL_EXPORTER_OTLP_HEADERS="x-logclaw-api-key=lc_proj_your_key_here"

npm run dev
```

Open http://localhost:3000 to use the UI.

## Run with Docker

```bash
docker build -t nestjs-notes .
docker run -p 3000:3000 \
  -e OTEL_EXPORTER_OTLP_ENDPOINT=https://otel.logclaw.ai \
  -e OTEL_EXPORTER_OTLP_HEADERS="x-logclaw-api-key=lc_proj_your_key_here" \
  nestjs-notes
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

OTel is initialized in `src/otel.ts` **before** NestJS bootstraps:

1. Creates `LoggerProvider` with OTLP HTTP + Console exporters
2. Sets the global logger provider
3. `LoggerService` (injectable) wraps the global OTel logger
4. Controllers inject `LoggerService` for structured logging
