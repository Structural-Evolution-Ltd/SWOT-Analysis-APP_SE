from pathlib import Path

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import Base, engine, get_db
from app.models.entities import CriteriaTemplate
from app.schemas.analysis import AnalysisRequest, AnalysisResponse, OptionResult
from app.schemas.mcda import AhpPreferences, AhpWeightsResponse
from app.schemas.reporting import ReportRequest, ReportResponse
from app.services.ahp import compute_ahp_weights
from app.services.brief_parser import suggest_criteria_from_brief
from app.services.reporting import markdown_to_latex_placeholder, render_report_markdown, try_render_with_quarto
from app.services.scoring import WeightedCriterion, evaluate_option, rank_options
from app.services.seed_data import seed_criteria_templates
from app.services.transport_rules import get_default_constraints

router = APIRouter()


@router.on_event("startup")
def init_db() -> None:
    Base.metadata.create_all(bind=engine)


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/transport/defaults")
def transport_defaults() -> list[dict]:
    return get_default_constraints()


@router.get("/criteria/templates")
def criteria_templates(db: Session = Depends(get_db)) -> list[dict]:
    seed_criteria_templates(db)
    rows = db.query(CriteriaTemplate).all()
    return [
        {
            "id": r.id,
            "title": r.title,
            "category": r.category,
            "default_weight": r.default_weight,
            "prompt_keywords": r.prompt_keywords,
        }
        for r in rows
    ]


@router.post("/criteria/suggest")
def suggest_from_brief(payload: dict, db: Session = Depends(get_db)) -> dict:
    seed_criteria_templates(db)
    templates = db.query(CriteriaTemplate).all()
    template_rows = [
        {
            "id": r.id,
            "title": r.title,
            "category": r.category,
            "default_weight": r.default_weight,
            "prompt_keywords": r.prompt_keywords,
        }
        for r in templates
    ]
    brief = payload.get("brief_text", "")
    return {"suggestions": suggest_criteria_from_brief(brief, template_rows)}


@router.post("/mcda/ahp-weights", response_model=AhpWeightsResponse)
def ahp_weights(preferences: AhpPreferences) -> AhpWeightsResponse:
    weights = compute_ahp_weights(
        sw=preferences.sw,
        so=preferences.so,
        st=preferences.st,
        wo=preferences.wo,
        wt=preferences.wt,
        ot=preferences.ot,
    )
    return AhpWeightsResponse(weights=weights)


@router.post("/analysis/run", response_model=AnalysisResponse)
def run_analysis(request: AnalysisRequest) -> AnalysisResponse:
    evaluations = []

    for option in request.options:
        criteria = [
            WeightedCriterion(
                category=s.category,
                factor_weight=s.factor_weight,
                score_best=s.score_best,
                score_base=s.score_base,
                score_worst=s.score_worst,
            )
            for s in option.scores
        ]
        evaluations.append(
            evaluate_option(
                option_name=option.option_name,
                criteria=criteria,
                category_weights=request.category_weights,
                thresholds=request.thresholds,
                risk_confidence=request.risk_confidence,
            )
        )

    ranked = rank_options(evaluations)
    winner = next((r.option_name for r in ranked if r.passed_gates), None)
    loser = ranked[-1].option_name if ranked else None

    return AnalysisResponse(
        ranking=[
            OptionResult(
                option_name=e.option_name,
                expected_score=e.expected_score,
                risk_adjusted_score=e.risk_adjusted_score,
                passed_gates=e.passed_gates,
                gate_failures=e.gate_failures,
            )
            for e in ranked
        ],
        winner=winner,
        loser=loser,
    )


@router.post("/report/generate", response_model=ReportResponse)
def generate_report(payload: ReportRequest) -> ReportResponse:
    markdown_path = render_report_markdown(payload, output_dir=Path("build/reports"))
    latex_path = markdown_to_latex_placeholder(markdown_path)
    rendered = try_render_with_quarto(
        markdown_path,
        dotx_template=Path("Resources/SEPXXXX-T-SE_REPORT_TEMPLATE_000-R04.dotx"),
    )

    return ReportResponse(
        markdown_path=str(markdown_path),
        latex_path=str(latex_path),
        dotx_note="Phase 1 DOTX output is placeholder-mapped for template alignment.",
        pdf_path=rendered["pdf_path"],
        docx_path=rendered["docx_path"],
        render_status=rendered["status"],
    )
