# Falcon PMS Setup

## Prerequisites
- Docker Desktop
- WSL2 (Windows) or native Docker (Mac/Linux)
- Git

## Quick Start
1. Clone the repo
2. Copy `.env.example` to `.env`
3. Run: `docker-compose up`
4. In another terminal: `docker-compose exec web python manage.py migrate`
5. Visit: http://localhost:8000

## Project Structure
- `config/` - Django settings
- `apps/` - All Django apps
- `requirements/` - Split requirements files
