# Next.js Notes — LogClaw Example

A minimal Next.js (App Router) app demonstrating OTLP log export to LogClaw.

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
docker build -t nextjs-notes .
docker run -p 3000:3000 \
  -e OTEL_EXPORTER_OTLP_ENDPOINT=https://otel.logclaw.ai \
  -e OTEL_EXPORTER_OTLP_HEADERS="x-logclaw-api-key=lc_proj_your_key_here" \
  nextjs-notes
```

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | React UI |
| GET | `/api/notes` | List notes |
| POST | `/api/notes` | Create note |
| DELETE | `/api/notes?id=:id` | Delete note |
| POST | `/api/notes/error` | Simulate error log |
| GET | `/api/health` | Health check |

## OTel Setup

Next.js auto-loads `instrumentation.ts` and calls `register()` on server startup:

1. Guards with `NEXT_RUNTIME === "nodejs"` (skips Edge runtime)
2. Dynamically imports all OTel packages
3. Creates `LoggerProvider` with OTLP HTTP + Console exporters
4. Starts `NodeSDK` and registers SIGTERM handler

Route handlers import `@/lib/logger` which uses the global OTel logger provider.
