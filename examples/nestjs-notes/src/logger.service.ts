/**
 * Injectable OTel Logger Service for NestJS.
 *
 * Wraps the global OTel logger provider (set up in otel.ts)
 * and exposes info/warn/error methods for use in controllers and services.
 */

import { Injectable } from "@nestjs/common";
import { logs, SeverityNumber } from "@opentelemetry/api-logs";

@Injectable()
export class LoggerService {
  private readonly serviceName =
    process.env.OTEL_SERVICE_NAME || "nestjs-notes";

  private emit(
    severityNumber: SeverityNumber,
    severityText: string,
    message: string,
    attrs?: Record<string, string | number | boolean>
  ) {
    const logger = logs.getLogger(this.serviceName);
    logger.emit({
      severityNumber,
      severityText,
      body: message,
      attributes: attrs,
    });
  }

  info(msg: string, attrs?: Record<string, string | number | boolean>) {
    this.emit(SeverityNumber.INFO, "INFO", msg, attrs);
  }

  warn(msg: string, attrs?: Record<string, string | number | boolean>) {
    this.emit(SeverityNumber.WARN, "WARN", msg, attrs);
  }

  error(msg: string, attrs?: Record<string, string | number | boolean>) {
    this.emit(SeverityNumber.ERROR, "ERROR", msg, attrs);
  }
}
