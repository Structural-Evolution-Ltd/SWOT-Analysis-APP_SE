# SWOT Analysis App (Phase 1)

Weighted SWOT and MCDA decision analysis tool for FRP bridge and related product options.

## Stack
- Backend: FastAPI + PostgreSQL
- Frontend: React + Vite + Plotly
- Reporting: Markdown source with Quarto/Pandoc path to PDF and DOCX

## Structure
- `src/backend` API, scoring engine, data model
- `src/frontend` local web UI
- `src/reporting` reporting templates and config
- `Resources` source templates and transport references

## Quick Start

Prerequisites:
- Python 3.12+
- Node.js 20+ (includes npm)
- Quarto (optional, for PDF/DOCX rendering)

### 1. Run backend

```powershell
cd src/backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 2. Run frontend

```powershell
cd src/frontend
npm install
npm run dev
```

Frontend URL: `http://127.0.0.1:5173`

## Key Phase 1 Features Implemented
- Project brief input with criteria suggestion.
- Editable UK transport constraint defaults.
- Weighted SWOT scoring with reverse handling for W/T.
- Simplified AHP wizard for dynamic SWOT category weighting.
- Risk-adjusted ranking with winner and loser.
- Auto-generated combination option from selected options.
- Summary ranking and Plotly chart.
- Initial report generation endpoint (markdown + latex placeholder).

## Notes
- DOTX output is placeholder-mapped in Phase 1.
- Quarto/Pandoc final rendering commands are in `src/reporting/README.md`.
