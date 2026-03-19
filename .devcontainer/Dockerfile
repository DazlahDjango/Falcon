# .devcontainer/Dockerfile
FROM mcr.microsoft.com/devcontainers/python:3.11

# Install system dependencies
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    libpq-dev \
    gcc \
    libcairo2 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libgdk-pixbuf2.0-0 \
    libffi-dev \
    shared-mime-info \
    gettext \
    curl \
    wget \
    git \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /workspaces/falcon-pms

# Copy requirements first for better layer caching
COPY requirements/ /tmp/requirements/

# Create logs directory
RUN mkdir -p /workspaces/falcon-pms/logs

# Keep the container running
CMD ["sleep", "infinity"]