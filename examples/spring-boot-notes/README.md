# Spring Boot Notes — LogClaw Example

A minimal Spring Boot app demonstrating OTLP log export to LogClaw using the **OpenTelemetry Java Agent** (zero-code instrumentation).

## Run Locally

```bash
# Build
mvn package -DskipTests

# Download OTel Java Agent
curl -L -o opentelemetry-javaagent.jar \
  https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/download/v2.10.0/opentelemetry-javaagent.jar

# Run with agent
export OTEL_EXPORTER_OTLP_ENDPOINT=https://otel.logclaw.ai
export OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf
export OTEL_EXPORTER_OTLP_HEADERS="x-logclaw-api-key=lc_proj_your_key_here"
export OTEL_SERVICE_NAME=spring-boot-notes

java -javaagent:opentelemetry-javaagent.jar -jar target/spring-boot-notes-1.0.0.jar
```

Open http://localhost:8080 to use the UI.

## Run with Docker

```bash
docker build -t spring-boot-notes .
docker run -p 8080:8080 \
  -e OTEL_EXPORTER_OTLP_ENDPOINT=https://otel.logclaw.ai \
  -e OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf \
  -e OTEL_EXPORTER_OTLP_HEADERS="x-logclaw-api-key=lc_proj_your_key_here" \
  -e OTEL_SERVICE_NAME=spring-boot-notes \
  spring-boot-notes
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

**Zero-code instrumentation** — no OTel SDK dependencies in `pom.xml`:

1. The OTel Java Agent (`-javaagent:opentelemetry-javaagent.jar`) auto-instruments SLF4J/Logback
2. All `log.info()` / `log.error()` calls are exported as OTLP log records
3. Configuration is entirely via environment variables
4. This is the most stable OTel integration — the Java agent is production-grade
