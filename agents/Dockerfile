# Build stage
FROM golang:1.21-alpine AS builder

WORKDIR /app

# Copy go mod files
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o agent .

# Final stage
FROM alpine:latest

RUN apk --no-cache add ca-certificates

WORKDIR /root/

# Copy the binary from builder stage
COPY --from=builder /app/agent .

# Create non-root user
RUN addgroup -g 1001 -S agent && \
    adduser -u 1001 -S agent -G agent

# Change ownership of the binary
RUN chown agent:agent /root/agent

# Switch to non-root user
USER agent

# Expose port
EXPOSE 8080

# Run the agent
CMD ["./agent"] 