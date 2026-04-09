# Phase 1 Scope - Weighted SWOT + MCDA Tool

## Product Intent
Build a local single-user decision analysis application for FRP bridge and related product options using a weighted SWOT model with MCDA support.

The app will support:
- Ranked shortlist of options.
- Opportunity insights and candidate combinations.
- Clear winner and loser detection.
- Exportable client-ready reporting.

## Decisions Confirmed

### Platform and Architecture
- Frontend: React.
- Backend: FastAPI.
- Deployment mode: local single-user (Phase 1).
- Data store: embedded SQLite database (editable via app).

### Decision Model
- Scoring scale: 1-10.
- Weighting:
  - SWOT category weights (S/W/O/T).
  - Factor-level weights within each category.
- MCDA method:
  - AHP-derived weights (simplified wizard, not full pairwise matrix editor).
  - Weighted Sum Model (WSM) ranking.
- Scoring behavior:
  - Weakness and Threat criteria are reverse scored.
- Gate thresholds (default):
  - S >= 6
  - W <= 4 equivalent after reverse handling
  - O >= 6
  - T <= 4 equivalent after reverse handling
- Winner/loser rule:
  - Winner must have highest score and pass gate thresholds.
  - Loser is lowest ranked option after evaluation.

### Option and Scenario Handling
- Supported option types:
  - FRP bridge systems
  - FRP walkways/cycle tracks
  - Continuous vs split installation strategies
  - Non-FRP alternatives (steel, timber, concrete)
  - Supplier/manufacturer alternatives
- Continuous vs split transport/installation:
  - Represented as separate options.
  - Constraints are project-specific using UK transport rules.
- Combination options:
  - Auto-generated from user-selected base options.

### Uncertainty
- Included in Phase 1.
- Each criterion can support uncertainty ranges/scenarios (for example best/base/worst).

### Inputs and Data Management
- Manual input forms.
- Import from provided Excel template.
- CSV import/export.
- JSON project save/load.
- Editable criteria library with dropdown-driven entry.
- Project brief text block used to suggest criteria from the criteria library.

### Outputs and Visualization
- Summary sheet across all options.
- Component analysis pages.
- Weighting adjustment controls.
- Plotly charts (bar/radar and scenario comparison).
- Clear winner and loser indicators.

### Reporting
- Output formats required in Phase 1:
  - LaTeX-based report generation.
  - DOTX-based report generation.
  - PDF output for client review.
- PDF pipeline: Quarto/Pandoc.
- Branding requirement: strict template matching intent.
- DOTX detail level in Phase 1: placeholder mapping now, section polish in Phase 1.1.
- UK transport defaults are pre-populated from:
  - `Resources/A_brief_guide_to_overhanging_loads.pdf`
  - https://haulageexchange.co.uk/blog/abnormal-and-wide-load-regulations-uk/
- Users can alter populated transport constraints per project.

### Scope Boundary
- Dashboard scope: single project with multi-option comparison only.
- Versioning: no formal version history in Phase 1.

## Phase 1 Success Criteria
- Clean summary table with clear criteria scoring and reporting.
- Easy scoring of multiple designs within one project.
- Architecture supports Phase 2 expansion without restart.

## Uncertainty Ranking Decision
- Ranking default uses risk-adjusted score.
- Base and expected score are retained for transparency.

## Proposed Initial Build Milestone (Vertical Slice)
1. Data model and SQLite schema.
2. Criteria library and option entry forms.
3. Weighted SWOT + reverse scoring + gate threshold engine.
4. AHP simplified wizard + WSM ranking.
5. Summary page with winner/loser + Plotly charts.
6. JSON/CSV import-export.
7. Initial report pipeline (LaTeX draft + DOTX placeholder mapping + PDF generation).
