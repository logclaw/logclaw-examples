/**
 * OTel Logger — mirrors LogClaw Auth Proxy production pattern.
 *
 * - OTLP HTTP exporter (if OTEL_EXPORTER_OTLP_ENDPOINT is set)
 * - Console exporter (always, for stdout/Docker fallback)
 * - Helper functions: logger.info(), logger.warn(), logger.error()
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

const serviceName = process.env.OTEL_SERVICE_NAME || "express-notes";

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
const _logger = logs.getLogger(serviceName);

function emit(
  severityNumber: SeverityNumber,
  severityText: string,
  message: string,
  attrs?: Record<string, string | number | boolean>
) {
  _logger.emit({
    severityNumber,
    severityText,
    body: message,
    attributes: attrs,
  });
}

export const logger = {
  info: (msg: string, attrs?: Record<string, string | number | boolean>) =>
    emit(SeverityNumber.INFO, "INFO", msg, attrs),
  warn: (msg: string, attrs?: Record<string, string | number | boolean>) =>
    emit(SeverityNumber.WARN, "WARN", msg, attrs),
  error: (msg: string, attrs?: Record<string, string | number | boolean>) =>
    emit(SeverityNumber.ERROR, "ERROR", msg, attrs),
};

export function shutdownLogger(): Promise<void> {
  return provider.shutdown();
}
