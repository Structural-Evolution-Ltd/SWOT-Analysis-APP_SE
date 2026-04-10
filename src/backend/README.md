# Backend (FastAPI)

Uses PostgreSQL via SQLAlchemy and psycopg.

## Run

```powershell
cd src/backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
# copy .env.example to .env and set DATABASE_URL for your hosted Postgres
uvicorn app.main:app --reload
```

API base URL: `http://127.0.0.1:8000/api`
