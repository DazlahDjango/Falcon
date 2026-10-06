# ============================================================================
# FALCON PMS - CELERY WORKER / BEAT DOCKERFILE
# Production Dockerfile for asynchronous worker processes
# ============================================================================

FROM python:3.11-slim AS builder

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    DEBIAN_FRONTEND=noninteractive

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    libpq-dev \
    libcairo2-dev \
    libpango1.0-dev \
    libgdk-pixbuf2.0-dev \
    libffi-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements/ /app/requirements/
RUN pip install --no-cache-dir --user -r /app/requirements/production.txt


FROM python:3.11-slim AS runner

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PATH=/home/falcon/.local/bin:$PATH

RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    libcairo2 \
    libpango-1.0-0 \
    libgdk-pixbuf2.0-0 \
    curl \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Create non-root system user and group
RUN groupadd -r falcon && useradd -r -g falcon -d /home/falcon -m falcon

WORKDIR /app

COPY --from=builder /root/.local /home/falcon/.local
COPY --chown=falcon:falcon . /app/

RUN mkdir -p /app/logs \
    && chown -R falcon:falcon /app \
    && chmod +x /app/infrastructure/docker/celery/entrypoint.sh

USER falcon

ENTRYPOINT ["/app/infrastructure/docker/celery/entrypoint.sh"]
CMD ["celery", "-A", "config", "worker", "-l", "INFO", "--concurrency=4"]
