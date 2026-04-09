from pydantic import BaseModel, Field


class AhpPreferences(BaseModel):
    sw: float = Field(default=1.0, ge=1.0, le=9.0)
    so: float = Field(default=1.0, ge=1.0, le=9.0)
    st: float = Field(default=1.0, ge=1.0, le=9.0)
    wo: float = Field(default=1.0, ge=1.0, le=9.0)
    wt: float = Field(default=1.0, ge=1.0, le=9.0)
    ot: float = Field(default=1.0, ge=1.0, le=9.0)


class AhpWeightsResponse(BaseModel):
    weights: dict[str, float]
