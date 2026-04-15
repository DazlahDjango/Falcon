# Dockerfile
FROM mcr.microsoft.com/devcontainers/python:3.11

# Install system dependencies
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    libpq-dev \
    gcc \
    libcairo2 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libgdk-pixbuf-xlib-2.0-0 \
    libffi-dev \
    shared-mime-info \
    gettext \
    curl \
    wget \
    git \
    nodejs \
    npm \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set working directory to match dev container exactly
WORKDIR /workspaces/falcon-pms

# Copy requirements first for better layer caching
COPY requirements/ /tmp/requirements/
RUN pip install --no-cache-dir -r /tmp/requirements/development.txt

# Copy project files
COPY . .

# Create logs directory
RUN mkdir -p /workspaces/falcon-pms/logs

# Expose the port (standard for Django)
EXPOSE 8000

# Keep the container running or start the server
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
