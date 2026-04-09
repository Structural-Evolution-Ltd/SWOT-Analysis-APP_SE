from sqlalchemy.orm import Session

from app.models.entities import CriteriaTemplate


DEFAULT_TEMPLATES = [
    {"title": "Durability in aggressive environment", "category": "S", "default_weight": 1.2, "prompt_keywords": "durability,marine,corrosion,coastal"},
    {"title": "Rapid installation window", "category": "S", "default_weight": 1.1, "prompt_keywords": "install,programme,time,closure"},
    {"title": "Fabrication lead time risk", "category": "W", "default_weight": 1.0, "prompt_keywords": "lead time,manufacturer,supply"},
    {"title": "Cost volatility", "category": "W", "default_weight": 1.0, "prompt_keywords": "cost,budget,inflation"},
    {"title": "Net zero funding alignment", "category": "O", "default_weight": 1.1, "prompt_keywords": "net zero,carbon,grant,funding"},
    {"title": "Lifecycle monitoring opportunity", "category": "O", "default_weight": 0.9, "prompt_keywords": "monitoring,sensor,digital twin"},
    {"title": "Abnormal load permit complexity", "category": "T", "default_weight": 1.1, "prompt_keywords": "abnormal,wide load,transport,permit"},
    {"title": "Site access constraints", "category": "T", "default_weight": 1.0, "prompt_keywords": "site access,crane,traffic,road"},
]


def seed_criteria_templates(db: Session) -> None:
    if db.query(CriteriaTemplate).count() > 0:
        return

    for template in DEFAULT_TEMPLATES:
        db.add(CriteriaTemplate(**template))

    db.commit()
