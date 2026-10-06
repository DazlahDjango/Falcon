# ============================================================================
# FALCON PMS - BACKEND PRODUCTION DOCKERFILE
# Multi-stage build for Python 3.11 (HTTP ASGI/WSGI)
# ============================================================================

# Stage 1: Build stage for dependencies
FROM python:3.11-slim AS builder

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    DEBIAN_FRONTEND=noninteractive

WORKDIR /app

# Install system build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    libpq-dev \
    libcairo2-dev \
    libpango1.0-dev \
    libgdk-pixbuf2.0-dev \
    libffi-dev \
    shared-mime-info \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements files
COPY requirements/ /app/requirements/

# Install dependencies into user directory
RUN pip install --no-cache-dir --user -r /app/requirements/production.txt


# Stage 2: Production runtime image
FROM python:3.11-slim AS runner

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PATH=/home/falcon/.local/bin:$PATH

# Install runtime C libraries for WeasyPrint, Postgres, Gettext
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    libcairo2 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libgdk-pixbuf2.0-0 \
    shared-mime-info \
    gettext \
    curl \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Create non-root system user and group
RUN groupadd -r falcon && useradd -r -g falcon -d /home/falcon -m falcon

WORKDIR /app

# Copy installed Python packages from builder stage
COPY --from=builder /root/.local /home/falcon/.local

# Copy application code with permissions
COPY --chown=falcon:falcon . /app/

# Create application runtime directories and set ownership
RUN mkdir -p /app/staticfiles /app/media /app/logs \
    && chown -R falcon:falcon /app \
    && chmod +x /app/infrastructure/docker/backend/entrypoint.sh

USER falcon

EXPOSE 8000

ENTRYPOINT ["/app/infrastructure/docker/backend/entrypoint.sh"]
CMD ["gunicorn", "config.asgi:application", "-k", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000", "--workers", "4", "--access-logfile", "-"]
