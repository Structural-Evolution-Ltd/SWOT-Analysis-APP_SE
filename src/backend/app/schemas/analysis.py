from pydantic import BaseModel, Field


class CriterionScoreInput(BaseModel):
    criterion_id: int
    category: str
    factor_weight: float = Field(ge=0.0)
    score_best: float = Field(ge=1, le=10)
    score_base: float = Field(ge=1, le=10)
    score_worst: float = Field(ge=1, le=10)


class OptionInput(BaseModel):
    option_name: str
    scores: list[CriterionScoreInput]


class AnalysisRequest(BaseModel):
    category_weights: dict[str, float]
    thresholds: dict[str, float]
    options: list[OptionInput]
    risk_confidence: float = Field(default=0.65, ge=0.0, le=1.0)


class OptionResult(BaseModel):
    option_name: str
    expected_score: float
    risk_adjusted_score: float
    passed_gates: bool
    gate_failures: list[str]


class AnalysisResponse(BaseModel):
    ranking: list[OptionResult]
    winner: str | None
    loser: str | None
