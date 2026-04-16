from sqlalchemy import Column, Float, Integer, String

from app.db.database import Base


class CriteriaTemplate(Base):
    __tablename__ = "criteria_templates"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), nullable=False)
    category = Column(String(1), nullable=False)
    default_weight = Column(Float, nullable=False)
    prompt_keywords = Column(String(250), nullable=True)
