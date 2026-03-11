# LogClaw Example Apps

Working examples showing how to send OpenTelemetry (OTLP) logs to [LogClaw](https://logclaw.ai).

Each example is a simple **Notes** CRUD app with in-memory storage. The focus is on the OTel logging setup — not the app logic.

## Examples

| App | Framework | Port | OTel Setup |
|-----|-----------|------|------------|
| [FastAPI Notes](examples/fastapi-notes/) | Python + FastAPI | 8001 | SDK + HTTP exporter |
| [Express Notes](examples/express-notes/) | Node.js + Express | 8002 | SDK + HTTP exporter |
| [Next.js Notes](examples/nextjs-notes/) | Next.js (App Router) | 8003 | SDK + instrumentation.ts |
| [NestJS Notes](examples/nestjs-notes/) | NestJS | 8004 | SDK + HTTP exporter |
| [Spring Boot Notes](examples/spring-boot-notes/) | Java + Spring Boot | 8005 | Java Agent (zero-code) |

## Quick Start

### 1. Set your API key

```bash
cp .env.example .env
# Edit .env and add your LogClaw API key
```

Get your API key from [console.logclaw.ai](https://console.logclaw.ai) → **Settings → API Keys**.

### 2. Run with Docker Compose

```bash
docker compose up --build
```

This starts all 5 apps + an OTel Collector that forwards logs to LogClaw.

### 3. Send a test log

```bash
# Create a note (INFO log)
curl -X POST http://localhost:8001/api/notes \
  -H "Content-Type: application/json" \
  -d '{"title": "Hello", "content": "First note!"}'

# Trigger an error (ERROR log)
curl -X POST http://localhost:8001/api/notes/error
```

### 4. See logs in LogClaw

Open [console.logclaw.ai](https://console.logclaw.ai) — your logs should appear within seconds.

## Run a Single App

Each example can run standalone. See the README in each example directory:

```bash
cd examples/fastapi-notes
pip install -r requirements.txt
OTEL_EXPORTER_OTLP_ENDPOINT=https://otel.logclaw.ai uvicorn main:app --reload
```

## How It Works

```
┌─────────────┐    OTLP/HTTP    ┌────────────────┐    OTLP/HTTP    ┌─────────┐
│  Your App   │ ──────────────► │ OTel Collector  │ ──────────────► │ LogClaw │
│ (SDK logs)  │   :4318/v1/logs │ (docker-compose)│                 │  Cloud  │
└─────────────┘                 └────────────────┘                 └─────────┘
```

All apps use the **OTLP HTTP exporter** — the same transport LogClaw uses in production.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OTEL_EXPORTER_OTLP_ENDPOINT` | OTel Collector endpoint | — |
| `OTEL_SERVICE_NAME` | Service name in logs | (per app) |
| `LOGCLAW_API_KEY` | LogClaw API key (for Collector) | — |
| `LOGCLAW_ENDPOINT` | LogClaw OTLP endpoint (for Collector) | `https://otel.logclaw.ai` |

## Self-Hosted

For self-hosted LogClaw deployments, set `LOGCLAW_ENDPOINT=http://your-collector:4318` in `.env` and remove the `LOGCLAW_API_KEY` (self-hosted doesn't need auth).

## License

MIT
