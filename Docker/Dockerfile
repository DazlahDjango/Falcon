# ============================================================================
# FALCON PMS - PRODUCTION DOCKERFILE
# Multi-stage build for Python 3.11 (HTTP ASGI/WSGI + Celery Workers)
# ============================================================================

# Stage 1: Build stage for installing dependencies
FROM python:3.11-slim as builder

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

# Install wheels
RUN pip install --no-cache-dir --user -r /app/requirements/production.txt


# Stage 2: Final runtime image
FROM python:3.11-slim as runner

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PATH=/root/.local/bin:$PATH

WORKDIR /app

# Install runtime system libraries required by WeasyPrint / cairo / pango / postgres
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

# Copy installed Python packages from builder stage
COPY --from=builder /root/.local /root/.local

# Copy application source code
COPY . /app/

# Create non-root user and required runtime directories
RUN mkdir -p /app/staticfiles /app/media /app/logs \
    && chmod +x /app/Docker/entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["/app/Docker/entrypoint.sh"]
CMD ["gunicorn", "config.asgi:application", "-k", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000", "--workers", "4"]
