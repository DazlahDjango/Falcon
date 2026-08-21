# Contributing to Falcon PMS

Thank you for your interest in contributing to **Falcon Performance Management System (Falcon PMS)**! We welcome contributions, bug fixes, feature requests, and improvements from developers of all skill levels.

---

## Core Maintainers

Falcon PMS is actively developed and maintained by:
* **Dazlah** ([@DazlahDjango](https://github.com/DazlahDjango))
* **Careen** ([@acareen15](https://github.com/acareen15))

If you have questions, design feedback, or need guidance on a pull request, feel free to mention us or reach out via GitHub.

---

## Code of Conduct

Please note that this project is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating in this project, you agree to abide by its terms.

---

## How Can I Contribute?

### 1. Reporting Bugs
Before creating a bug report, please search existing issues to ensure it hasn't already been reported. When filing an issue, include:
* A clear and descriptive title.
* Detailed steps to reproduce the bug.
* Expected vs. actual behavior.
* Relevant log snippets or stack trace outputs.
* Environment details (OS, Python version, Django version).

### 2. Suggesting Enhancements
Feature requests are always welcome! When suggesting an enhancement:
* Use a clear, descriptive title.
* Provide a step-by-step description of the suggested enhancement.
* Explain why this feature would be useful to Falcon PMS users.

### 3. Submitting Pull Requests (PRs)
1. Fork the repository and create your branch from `main` or `develop`.
2. Follow our code structure and architecture guidelines.
3. Make sure tests and system checks pass cleanly.
4. Submit a clear and detailed Pull Request (PR) referencing any related issue IDs.

---

## Local Development Setup

### 1. Prerequisites
* Python 3.11+
* PostgreSQL 14+
* Redis Server

### 2. Environment Setup

```bash
# Clone the repository
git clone https://github.com/DazlahDjango/Falcon.git
cd Falcon

# Create and activate virtual environment
python -m venv fasc
# On Windows PowerShell:
fasc\Scripts\activate
# On Linux/macOS:
source fasc/bin/activate

# Install dependencies
pip install -r PA_requirements.txt
```

### 3. Environment Variables

Falcon PMS uses a modular environment structure located in `envs/`:
* `envs/base.env`: Django base configuration.
* `envs/database.env`: PostgreSQL & Redis connection parameters.
* `envs/auth.env`: JWT, MFA, TOTP, & OAuth credentials.
* `envs/billing.env`: Billing settings & Paystack keys.
* `envs/configs.env`: Backups, DR, Maintenance, & Health options.

Copy or edit any env files in `envs/` as needed for local testing.

### 4. Database & System Checks

```bash
# Run Django system check
python manage.py check

# Run database migrations
python manage.py migrate

# Start the development server
python manage.py runserver
```

---

## Architecture & Code Guidelines

### Settings Architecture
Falcon PMS uses a modular settings layout under `config/settings/`:
* `config/settings/base.py`: Main entry point loading components.
* `config/settings/components/`: Componentized settings files (`apps.py`, `middleware.py`, `database.py`, `authentication.py`, `security.py`, `cache.py`, `celery.py`, `channels.py`, `billing.py`, `tenant.py`, `configs.py`).

When adding new settings or third-party packages:
* Add package dependencies to `config/settings/components/apps.py`.
* Add custom setting values to the corresponding component module in `config/settings/components/`.

### Coding Standards
* **Python**: Follow PEP 8 guidelines. Keep functions modular and maintain explicit typing where helpful.
* **Commit Messages**: Write clear, descriptive commit messages (e.g., `feat(billing): add Paystack webhook validation`).
* **Pull Requests**: Keep PRs focused on a single feature or fix to streamline code review.

---

## Contact & Support

For questions, discussions, or assistance:
* Open an issue on GitHub.
* Contact the maintainers: [@DazlahDjango](https://github.com/DazlahDjango) or [@acareen15](https://github.com/acareen15).
