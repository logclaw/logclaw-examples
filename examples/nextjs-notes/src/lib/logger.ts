/**
 * Server-side logger for Next.js route handlers.
 *
 * Uses the global OTel LoggerProvider set up in instrumentation.ts.
 * Import this in API routes / server components to emit structured logs.
 */

import { logs, SeverityNumber } from "@opentelemetry/api-logs";

const serviceName = process.env.OTEL_SERVICE_NAME || "nextjs-notes";

function emit(
  severityNumber: SeverityNumber,
  severityText: string,
  message: string,
  attrs?: Record<string, string | number | boolean>
) {
  const logger = logs.getLogger(serviceName);
  logger.emit({
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
