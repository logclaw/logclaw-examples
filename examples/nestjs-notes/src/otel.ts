/**
 * OTel Logging Setup — called before NestJS bootstrap.
 *
 * Same pattern as LogClaw Auth Proxy, adapted for NestJS.
 */

import { logs, SeverityNumber } from "@opentelemetry/api-logs";
import {
  LoggerProvider,
  BatchLogRecordProcessor,
  ConsoleLogRecordExporter,
} from "@opentelemetry/sdk-logs";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { Resource } from "@opentelemetry/resources";
import { SEMRESATTRS_SERVICE_NAME } from "@opentelemetry/semantic-conventions";

const serviceName = process.env.OTEL_SERVICE_NAME || "nestjs-notes";

const resource = new Resource({
  [SEMRESATTRS_SERVICE_NAME]: serviceName,
});

const provider = new LoggerProvider({ resource });

const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
if (otlpEndpoint) {
  provider.addLogRecordProcessor(
    new BatchLogRecordProcessor(
      new OTLPLogExporter({ url: `${otlpEndpoint}/v1/logs` })
    )
  );
}
// Always emit to stdout (Docker / K8s log driver fallback)
provider.addLogRecordProcessor(
  new BatchLogRecordProcessor(new ConsoleLogRecordExporter())
);

logs.setGlobalLoggerProvider(provider);

export { provider as loggerProvider };
