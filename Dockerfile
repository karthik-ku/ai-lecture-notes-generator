# Multi-stage Dockerfile for Spring Boot Backend
FROM maven:3.9.6-eclipse-temurin-17 AS builder
WORKDIR /app

# Copy pom.xml and source code from backend directory
COPY backend/pom.xml ./pom.xml
COPY backend/src ./src

# Package application jar (skip tests during container build for speed)
RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

COPY --from=builder /app/target/*.jar app.jar

ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
