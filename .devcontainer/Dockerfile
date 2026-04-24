FROM mcr.microsoft.com/devcontainers/python:3.11

# Install system dependencies
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    libpq-dev \
    gcc \
    libcairo2 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libgdk-pixbuf-2.0-0 \
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

# Install Node.js 22.x (current LTS)
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better layer caching
COPY requirements/ /tmp/requirements/

# Create necessary directories and set permissions
RUN mkdir -p /workspaces/falcon-pms/logs \
    && mkdir -p /workspaces/falcon-pms/staticfiles \
    && mkdir -p /workspaces/falcon-pms/media \
    && chown -R vscode:vscode /workspaces/falcon-pms

# Switch to non-root user
USER vscode

# Keep the container running
CMD ["sleep", "infinity"]