# unsu.com - Docker Container
# Base: Alpine Linux (minimal, secure)
# Multi-stage build for optimization

FROM python:3.12-alpine AS builder

# Install build dependencies
RUN apk add --no-cache \
    gcc \
    musl-dev \
    linux-headers

# Set working directory
WORKDIR /build

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# ============================================
# Production Stage
# ============================================
FROM python:3.12-alpine

# Labels
LABEL maintainer="unsu.com"
LABEL version="1.0"
LABEL description="A wallet everyone can use - Minimal crypto wallet"

# Install runtime dependencies
RUN apk add --no-cache \
    curl \
    && rm -rf /var/cache/apk/*

# Create non-root user
RUN addgroup -g 1000 unsu && \
    adduser -D -u 1000 -G unsu unsu

# Set working directory
WORKDIR /app

# Copy Python dependencies from builder
COPY --from=builder /root/.local /home/unsu/.local

# Copy application code
COPY --chown=unsu:unsu . /app

# Create data directory
RUN mkdir -p /data && chown unsu:unsu /data

# Switch to non-root user
USER unsu

# Add local bin to PATH
ENV PATH=/home/unsu/.local/bin:$PATH

# Expose ports
EXPOSE 3333 3334

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:3333/ || exit 1

# Default command (can be overridden in docker-compose.yml)
CMD ["python3", "server.py"]
