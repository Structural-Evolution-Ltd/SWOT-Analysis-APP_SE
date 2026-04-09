from enum import Enum

from pydantic import BaseModel, Field


class Direction(str, Enum):
    higher_better = "higher_better"
    lower_better = "lower_better"


class StudyCreate(BaseModel):
    name: str = Field(min_length=2, max_length=200)
    description: str | None = None


class StudyOut(BaseModel):
    id: int
    name: str
    description: str | None = None
    status: str


class CriterionCreate(BaseModel):
    name: str = Field(min_length=2, max_length=200)
    category: str = Field(min_length=2, max_length=50)
    weight: float = Field(gt=0)
    direction: Direction = Direction.higher_better
    is_active: bool = True


class CriterionOut(BaseModel):
    id: int
    study_id: int
    name: str
    category: str
    weight: float
    direction: Direction
    is_active: bool


class OptionCreate(BaseModel):
    name: str = Field(min_length=2, max_length=200)
    description: str | None = None


class OptionOut(BaseModel):
    id: int
    study_id: int
    name: str
    description: str | None = None
    is_active: bool


class ScoreUpdateItem(BaseModel):
    criterion_id: int
    raw_score: int = Field(ge=1, le=5)


class ScoreUpdateRequest(BaseModel):
    scores: list[ScoreUpdateItem]


class SwotEntryCreate(BaseModel):
    swot_type: str = Field(pattern="^[SWOT]$")
    title: str = Field(min_length=2, max_length=200)
    rating: int = Field(ge=-3, le=3)
    note: str | None = None


class DashboardRow(BaseModel):
    option_id: int
    option_name: str
    weighted_score: float
    swot_net: int
    combined_score: float
    rank: int


class DashboardOut(BaseModel):
    study_id: int
    winner: str | None
    loser: str | None
    rows: list[DashboardRow]


class ComparisonOut(BaseModel):
    study_id: int
    option_ids: list[int]
    rows: list[DashboardRow]
