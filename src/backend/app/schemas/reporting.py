from pydantic import BaseModel


class ReportOption(BaseModel):
    option_name: str
    risk_adjusted_score: float
    expected_score: float
    passed_gates: bool


class ReportRequest(BaseModel):
    project_name: str
    client_name: str | None = None
    executive_summary: str
    assumptions: list[str]
    ranking: list[ReportOption]
    winner: str | None
    loser: str | None


class ReportResponse(BaseModel):
    markdown_path: str
    latex_path: str
    dotx_note: str
    pdf_path: str | None = None
    docx_path: str | None = None
    render_status: str
