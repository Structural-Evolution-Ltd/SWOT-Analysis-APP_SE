from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.entities import BridgeOption, BridgeOptionScore, Study, StudyCriterion, SwotEntry
from app.schemas.mvp import (
    ComparisonOut,
    CriterionCreate,
    CriterionOut,
    DashboardOut,
    DashboardRow,
    OptionCreate,
    OptionOut,
    ScoreUpdateRequest,
    StudyCreate,
    StudyOut,
    SwotEntryCreate,
)
from app.services.mvp_scoring import CriterionScoreInput, combined_score, swot_net_score, weighted_option_score
from app.services.mvp_seed import DEFAULT_FRP_CRITERIA

router = APIRouter(prefix="/v1", tags=["mvp"])


def _study_or_404(db: Session, study_id: int) -> Study:
    study = db.query(Study).filter(Study.id == study_id).first()
    if not study:
        raise HTTPException(status_code=404, detail="Study not found")
    return study


def _option_or_404(db: Session, option_id: int) -> BridgeOption:
    option = db.query(BridgeOption).filter(BridgeOption.id == option_id).first()
    if not option:
        raise HTTPException(status_code=404, detail="Option not found")
    return option


def _build_dashboard_rows(db: Session, study_id: int, option_ids: list[int] | None = None) -> list[DashboardRow]:
    options_query = db.query(BridgeOption).filter(BridgeOption.study_id == study_id, BridgeOption.is_active.is_(True))
    if option_ids:
        options_query = options_query.filter(BridgeOption.id.in_(option_ids))
    options = options_query.all()

    rows: list[DashboardRow] = []
    for option in options:
        score_rows = (
            db.query(BridgeOptionScore, StudyCriterion)
            .join(StudyCriterion, StudyCriterion.id == BridgeOptionScore.criterion_id)
            .filter(BridgeOptionScore.option_id == option.id, StudyCriterion.is_active.is_(True))
            .all()
        )

        criteria_inputs = [
            CriterionScoreInput(weight=criterion.weight, direction=criterion.direction, raw_score=score.raw_score)
            for score, criterion in score_rows
        ]
        weighted = weighted_option_score(criteria_inputs)

        swot_ratings = [entry.rating for entry in db.query(SwotEntry).filter(SwotEntry.option_id == option.id).all()]
        swot_net = swot_net_score(swot_ratings)

        rows.append(
            DashboardRow(
                option_id=option.id,
                option_name=option.name,
                weighted_score=round(weighted, 4),
                swot_net=swot_net,
                combined_score=round(combined_score(weighted, swot_net), 4),
                rank=0,
            )
        )

    sorted_rows = sorted(rows, key=lambda r: r.combined_score, reverse=True)
    for index, row in enumerate(sorted_rows, start=1):
        row.rank = index

    return sorted_rows


@router.post("/studies", response_model=StudyOut)
def create_study(payload: StudyCreate, db: Session = Depends(get_db)) -> StudyOut:
    study = Study(name=payload.name, description=payload.description, status="draft")
    db.add(study)
    db.commit()
    db.refresh(study)
    return StudyOut(id=study.id, name=study.name, description=study.description, status=study.status)


@router.get("/studies", response_model=list[StudyOut])
def list_studies(db: Session = Depends(get_db)) -> list[StudyOut]:
    studies = db.query(Study).order_by(Study.id.desc()).all()
    return [StudyOut(id=s.id, name=s.name, description=s.description, status=s.status) for s in studies]


@router.post("/studies/{study_id}/criteria", response_model=CriterionOut)
def add_criterion(study_id: int, payload: CriterionCreate, db: Session = Depends(get_db)) -> CriterionOut:
    _study_or_404(db, study_id)

    criterion = StudyCriterion(
        study_id=study_id,
        name=payload.name,
        category=payload.category,
        weight=payload.weight,
        direction=payload.direction.value,
        is_active=payload.is_active,
    )
    db.add(criterion)
    db.flush()

    options = db.query(BridgeOption).filter(BridgeOption.study_id == study_id, BridgeOption.is_active.is_(True)).all()
    for option in options:
        db.add(BridgeOptionScore(option_id=option.id, criterion_id=criterion.id, raw_score=3))

    db.commit()
    db.refresh(criterion)
    return CriterionOut(
        id=criterion.id,
        study_id=criterion.study_id,
        name=criterion.name,
        category=criterion.category,
        weight=criterion.weight,
        direction=criterion.direction,
        is_active=criterion.is_active,
    )


@router.get("/studies/{study_id}/criteria", response_model=list[CriterionOut])
def list_criteria(study_id: int, db: Session = Depends(get_db)) -> list[CriterionOut]:
    _study_or_404(db, study_id)
    rows = db.query(StudyCriterion).filter(StudyCriterion.study_id == study_id).order_by(StudyCriterion.id.asc()).all()
    return [
        CriterionOut(
            id=row.id,
            study_id=row.study_id,
            name=row.name,
            category=row.category,
            weight=row.weight,
            direction=row.direction,
            is_active=row.is_active,
        )
        for row in rows
    ]


@router.post("/studies/{study_id}/criteria/seed-defaults")
def seed_default_criteria(study_id: int, db: Session = Depends(get_db)) -> dict:
    _study_or_404(db, study_id)

    existing = {c.name for c in db.query(StudyCriterion).filter(StudyCriterion.study_id == study_id).all()}
    created = 0

    for item in DEFAULT_FRP_CRITERIA:
        if item["name"] in existing:
            continue
        criterion = StudyCriterion(
            study_id=study_id,
            name=item["name"],
            category=item["category"],
            weight=item["weight"],
            direction=item["direction"],
            is_active=True,
        )
        db.add(criterion)
        db.flush()

        options = db.query(BridgeOption).filter(BridgeOption.study_id == study_id, BridgeOption.is_active.is_(True)).all()
        for option in options:
            db.add(BridgeOptionScore(option_id=option.id, criterion_id=criterion.id, raw_score=3))
        created += 1

    db.commit()
    return {"created": created}


@router.post("/studies/{study_id}/options", response_model=OptionOut)
def add_option(study_id: int, payload: OptionCreate, db: Session = Depends(get_db)) -> OptionOut:
    _study_or_404(db, study_id)

    option = BridgeOption(study_id=study_id, name=payload.name, description=payload.description, is_active=True)
    db.add(option)
    db.flush()

    criteria = db.query(StudyCriterion).filter(StudyCriterion.study_id == study_id, StudyCriterion.is_active.is_(True)).all()
    for criterion in criteria:
        db.add(BridgeOptionScore(option_id=option.id, criterion_id=criterion.id, raw_score=3))

    db.commit()
    db.refresh(option)
    return OptionOut(
        id=option.id,
        study_id=option.study_id,
        name=option.name,
        description=option.description,
        is_active=option.is_active,
    )


@router.get("/studies/{study_id}/options", response_model=list[OptionOut])
def list_options(study_id: int, db: Session = Depends(get_db)) -> list[OptionOut]:
    _study_or_404(db, study_id)
    rows = db.query(BridgeOption).filter(BridgeOption.study_id == study_id).order_by(BridgeOption.id.asc()).all()
    return [
        OptionOut(
            id=row.id,
            study_id=row.study_id,
            name=row.name,
            description=row.description,
            is_active=row.is_active,
        )
        for row in rows
    ]


@router.get("/options/{option_id}/scores")
def get_option_scores(option_id: int, db: Session = Depends(get_db)) -> dict:
    _option_or_404(db, option_id)
    rows = (
        db.query(BridgeOptionScore)
        .filter(BridgeOptionScore.option_id == option_id)
        .order_by(BridgeOptionScore.criterion_id.asc())
        .all()
    )
    return {
        "option_id": option_id,
        "scores": [{"criterion_id": row.criterion_id, "raw_score": row.raw_score} for row in rows],
    }


@router.put("/options/{option_id}/scores")
def update_option_scores(option_id: int, payload: ScoreUpdateRequest, db: Session = Depends(get_db)) -> dict:
    _option_or_404(db, option_id)

    updated = 0
    for item in payload.scores:
        score = (
            db.query(BridgeOptionScore)
            .filter(BridgeOptionScore.option_id == option_id, BridgeOptionScore.criterion_id == item.criterion_id)
            .first()
        )
        if score:
            score.raw_score = item.raw_score
            updated += 1

    db.commit()
    return {"updated": updated}


@router.post("/options/{option_id}/swot")
def add_swot_entry(option_id: int, payload: SwotEntryCreate, db: Session = Depends(get_db)) -> dict:
    _option_or_404(db, option_id)

    entry = SwotEntry(
        option_id=option_id,
        swot_type=payload.swot_type,
        title=payload.title,
        rating=payload.rating,
        note=payload.note,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return {"id": entry.id}


@router.get("/studies/{study_id}/dashboard", response_model=DashboardOut)
def study_dashboard(study_id: int, db: Session = Depends(get_db)) -> DashboardOut:
    _study_or_404(db, study_id)
    rows = _build_dashboard_rows(db, study_id)

    winner = rows[0].option_name if rows else None
    loser = rows[-1].option_name if rows else None

    return DashboardOut(study_id=study_id, winner=winner, loser=loser, rows=rows)


@router.get("/studies/{study_id}/comparison", response_model=ComparisonOut)
def option_comparison(
    study_id: int,
    option_ids: list[int] = Query(default=[]),
    db: Session = Depends(get_db),
) -> ComparisonOut:
    _study_or_404(db, study_id)
    rows = _build_dashboard_rows(db, study_id, option_ids=option_ids or None)
    return ComparisonOut(study_id=study_id, option_ids=option_ids, rows=rows)
