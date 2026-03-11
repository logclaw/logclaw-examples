FROM maven:3.9-eclipse-temurin-21 AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn package -DskipTests -B

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Download OTel Java Agent (zero-code instrumentation)
ARG OTEL_AGENT_VERSION=2.10.0
ADD https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/download/v${OTEL_AGENT_VERSION}/opentelemetry-javaagent.jar /app/opentelemetry-javaagent.jar

COPY --from=builder /app/target/*.jar app.jar
ENV PORT=8080
EXPOSE ${PORT}

# The Java agent auto-instruments all logging frameworks (SLF4J, Logback, Log4j2)
# and exports logs via OTLP. No code changes needed.
CMD java -javaagent:/app/opentelemetry-javaagent.jar -jar app.jar --server.port=${PORT}
