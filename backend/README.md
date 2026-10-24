# Fnote Loza — FastAPI & PostgreSQL Backend Service

Production backend for the Fnote Loza jewelry platform.

## Stack

- FastAPI and Pydantic Settings v2
- SQLAlchemy and PostgreSQL
- Alembic migrations
- HS256 JWT authentication and bcrypt password hashing

## Local setup (Windows)

Use Python 3.10 or later and PostgreSQL 14 or later.

```powershell
Set-Location backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

Edit `backend/.env` with the PostgreSQL URL and a unique signing secret. Generate a secret with:

```powershell
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

Set that output as `SECRET_KEY`. The secret must be at least 32 UTF-8 bytes. Do not commit it.

To bootstrap an owner account, set both `ADMIN_EMAIL` and `ADMIN_PASSWORD` in the environment file. Use a password no longer than 72 UTF-8 bytes. Seeding happens only when the database contains no administrators; startup never replaces an existing administrator or password. If these values are omitted, the API starts without creating an administrator and existing administrators can still sign in.

From the project root, apply migrations and start the server:

```powershell
alembic -c backend/alembic.ini upgrade head
python -m uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000
```

The settings loader reads `backend/.env` and the project-root `.env`; process environment variables take precedence. PostgreSQL remains the configured database and no database is recreated by these instructions.

- Health check: `http://127.0.0.1:8000/health`
- Interactive API docs: `http://127.0.0.1:8000/docs`

## Tests

Run backend tests with:

```powershell
python -m pytest backend/tests -v
```

The tests use an isolated SQLite database. Do not set the test process's `DATABASE_URL` to a production database.

## Docker

Supply `POSTGRES_PASSWORD` and `SECRET_KEY` from the deployment environment; do not place real credentials in the compose file.

```yaml
services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: fnote_user
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:?Set POSTGRES_PASSWORD}
      POSTGRES_DB: fnote_loza_db
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: .
    environment:
      DATABASE_URL: postgresql+psycopg://fnote_user:${POSTGRES_PASSWORD}@db:5432/fnote_loza_db
      SECRET_KEY: ${SECRET_KEY:?Set SECRET_KEY}
    depends_on:
      - db

volumes:
  postgres_data:
```
