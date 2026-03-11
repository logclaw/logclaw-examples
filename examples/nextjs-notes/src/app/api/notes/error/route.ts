import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";

export async function POST() {
  logger.error("Simulated database connection failure", {
    error_type: "ConnectionRefusedError",
    database: "notes-db",
  });
  return NextResponse.json({
    status: "error_logged",
    message: "ERROR log sent to LogClaw via OTLP",
  });
}
