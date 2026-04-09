`# FRP Bridge Option Appraisal Tool - MVP Definition

## 1. Product Requirements Summary
- Build a production-ready MVP web app to replace the weighted SWOT workbook workflow.
- Primary objective: compare multiple FRP bridge options consistently, transparently, and repeatably.
- Users can create and manage studies (projects).
- Each study supports:
  - editable criteria and weights,
  - criteria direction (`higher_better` or `lower_better`),
  - multiple options,
  - option scores against all active criteria,
  - SWOT entries,
  - automatic ranking dashboard.
- Scoring rules:
  - Raw score: 1-5.
  - `higher_better`: normalized = raw / 5.
  - `lower_better`: normalized = (6 - raw) / 5.
  - Weighted criterion score = weight * normalized.
  - Weighted option score = sum(weighted criterion scores).
  - SWOT rating: -3 to +3.
  - SWOT net = sum(SWOT entries).
  - Combined score = (weighted option score * 100) + SWOT net.

## 2. Recommended Architecture
- Frontend: React + TypeScript + Tailwind.
- Backend: FastAPI + SQLAlchemy + Pydantic.
- Database: SQLite for MVP, PostgreSQL-ready schema.
- Reporting/exports:
  - Excel export for workbook parity,
  - PDF export for review packs.
- Structure:
  - `frontend`: presentation, tables, dashboard, comparison.
  - `backend`: domain models, scoring service, API routes.
  - `reporting`: export adapters and templates.

## 3. Database Schema
Core entities:
- `Study`
  - `id`, `name`, `description`, `status`.
- `StudyCriterion`
  - `id`, `study_id`, `name`, `category`, `weight`, `direction`, `is_active`.
- `BridgeOption`
  - `id`, `study_id`, `name`, `description`, `is_active`.
- `BridgeOptionScore`
  - `id`, `option_id`, `criterion_id`, `raw_score` (1-5).
- `SwotEntry`
  - `id`, `option_id`, `swot_type`, `title`, `rating` (-3..+3), `note`.

Propagation constraints:
- New criterion auto-creates score rows for all active options (default raw=3).
- New option auto-creates score rows for all active criteria (default raw=3).

## 4. API Endpoints
Implemented scaffold endpoints (`/api/v1`):
- `POST /studies` create study.
- `GET /studies` list studies.
- `POST /studies/{study_id}/criteria` add criterion and propagate to options.
- `POST /studies/{study_id}/criteria/seed-defaults` load default FRP criteria.
- `POST /studies/{study_id}/options` add option and propagate criteria.
- `PUT /options/{option_id}/scores` update option raw scores.
- `POST /options/{option_id}/swot` add SWOT entry.
- `GET /studies/{study_id}/dashboard` ranked dashboard with winner/loser.
- `GET /studies/{study_id}/comparison?option_ids=...` selected option comparison.

## 5. Frontend Page Structure
Recommended pages:
- Studies List / Create Study.
- Study Workspace:
  - Criteria table (Excel-style grid).
  - Options table.
  - Score matrix (criteria rows x options columns).
  - SWOT editor.
- Dashboard:
  - weighted score, SWOT net, combined score, rank, winner/loser, chart.
- Comparison page:
  - side-by-side selected options.
- Export page/action:
  - Excel package,
  - PDF summary.

## 6. Component Hierarchy
- `AppShell`
  - `StudySelector`
  - `CriteriaTable`
  - `OptionTable`
  - `ScoreMatrix`
  - `SwotEditor`
  - `DashboardTable`
  - `RankingChart`
  - `ComparisonPanel`
  - `ExportActions`

## 7. MVP Implementation Plan
Phase 1:
- Entity model and migration baseline.
- CRUD for studies, criteria, options.
- Score propagation logic.
- Ranking API with exact formulas.
- Basic dashboard and comparison UI.

Phase 2:
- Excel import/export.
- PDF report templating.
- richer filtering/sensitivity views.

Phase 3:
- auth/multi-user,
- audit/version history,
- PostgreSQL deployment profile.

## 8. Seed Data (Default FRP Criteria)
Seed list has been included in code under:
- `src/backend/app/services/mvp_seed.py`

Categories included:
- Structural,
- Transport,
- Installation,
- Durability,
- Commercial,
- Risk.

## 9. Working Code Scaffold
Added backend scaffold components:
- Entities:
  - `src/backend/app/models/entities.py`
- Typed schemas:
  - `src/backend/app/schemas/mvp.py`
- Scoring engine:
  - `src/backend/app/services/mvp_scoring.py`
- Default criteria seed:
  - `src/backend/app/services/mvp_seed.py`
- API routes:
  - `src/backend/app/api/routes_mvp.py`
- App router registration:
  - `src/backend/app/main.py`

## 10. Local Setup and Deployment
### Local Run
Backend:
```powershell
cd src/backend
.\.venv\Scripts\python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Key MVP API base:
- `http://127.0.0.1:8000/api/v1`

### Quick Smoke Test
1. Create study via `POST /api/v1/studies`.
2. Seed defaults via `POST /api/v1/studies/{id}/criteria/seed-defaults`.
3. Add options via `POST /api/v1/studies/{id}/options`.
4. Update scores via `PUT /api/v1/options/{option_id}/scores`.
5. Add SWOT via `POST /api/v1/options/{option_id}/swot`.
6. View ranking via `GET /api/v1/studies/{id}/dashboard`.

### Deployment Path
- MVP: SQLite + Uvicorn (single instance).
- Production-ready next step:
  - move to PostgreSQL,
  - run with Gunicorn/Uvicorn workers behind reverse proxy,
  - add migrations (Alembic),
  - containerize backend and frontend.
