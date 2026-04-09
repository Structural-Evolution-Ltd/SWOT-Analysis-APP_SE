from sqlalchemy import Boolean, Column, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.db.database import Base


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    client_name = Column(String(150), nullable=True)
    brief_text = Column(Text, nullable=True)
    transport_rule_profile = Column(String(100), default="uk_default")

    options = relationship("Option", back_populates="project", cascade="all, delete-orphan")


class Criterion(Base):
    __tablename__ = "criteria"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    category = Column(String(1), nullable=False)  # S, W, O, T
    description = Column(Text, nullable=True)
    factor_weight = Column(Float, default=1.0)
    is_active = Column(Boolean, default=True)


class Option(Base):
    __tablename__ = "options"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    name = Column(String(150), nullable=False)
    option_type = Column(String(50), nullable=False)
    split_strategy = Column(String(20), default="continuous")
    notes = Column(Text, nullable=True)

    project = relationship("Project", back_populates="options")
    scores = relationship("OptionScore", back_populates="option", cascade="all, delete-orphan")


class OptionScore(Base):
    __tablename__ = "option_scores"

    id = Column(Integer, primary_key=True, index=True)
    option_id = Column(Integer, ForeignKey("options.id"), nullable=False)
    criterion_id = Column(Integer, ForeignKey("criteria.id"), nullable=False)
    score_best = Column(Float, nullable=False)
    score_base = Column(Float, nullable=False)
    score_worst = Column(Float, nullable=False)

    option = relationship("Option", back_populates="scores")


class CategoryWeight(Base):
    __tablename__ = "category_weights"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    category = Column(String(1), nullable=False)
    weight = Column(Float, nullable=False)


class GateThreshold(Base):
    __tablename__ = "gate_thresholds"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    category = Column(String(1), nullable=False)
    threshold = Column(Float, nullable=False)
    is_upper_bound = Column(Boolean, default=False)


class TransportConstraint(Base):
    __tablename__ = "transport_constraints"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    name = Column(String(150), nullable=False)
    value = Column(Float, nullable=False)
    unit = Column(String(20), nullable=False)
    description = Column(Text, nullable=True)


class CriteriaTemplate(Base):
    __tablename__ = "criteria_templates"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), nullable=False)
    category = Column(String(1), nullable=False)
    default_weight = Column(Float, nullable=False)
    prompt_keywords = Column(String(250), nullable=True)


class Study(Base):
    __tablename__ = "studies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(50), nullable=False, default="draft")

    criteria = relationship("StudyCriterion", back_populates="study", cascade="all, delete-orphan")
    options = relationship("BridgeOption", back_populates="study", cascade="all, delete-orphan")


class StudyCriterion(Base):
    __tablename__ = "study_criteria"

    id = Column(Integer, primary_key=True, index=True)
    study_id = Column(Integer, ForeignKey("studies.id"), nullable=False, index=True)
    name = Column(String(200), nullable=False)
    category = Column(String(50), nullable=False)
    weight = Column(Float, nullable=False, default=1.0)
    direction = Column(String(20), nullable=False, default="higher_better")
    is_active = Column(Boolean, nullable=False, default=True)

    study = relationship("Study", back_populates="criteria")
    option_scores = relationship("BridgeOptionScore", back_populates="criterion", cascade="all, delete-orphan")


class BridgeOption(Base):
    __tablename__ = "bridge_options"

    id = Column(Integer, primary_key=True, index=True)
    study_id = Column(Integer, ForeignKey("studies.id"), nullable=False, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)

    study = relationship("Study", back_populates="options")
    scores = relationship("BridgeOptionScore", back_populates="option", cascade="all, delete-orphan")
    swot_entries = relationship("SwotEntry", back_populates="option", cascade="all, delete-orphan")


class BridgeOptionScore(Base):
    __tablename__ = "bridge_option_scores"

    id = Column(Integer, primary_key=True, index=True)
    option_id = Column(Integer, ForeignKey("bridge_options.id"), nullable=False, index=True)
    criterion_id = Column(Integer, ForeignKey("study_criteria.id"), nullable=False, index=True)
    raw_score = Column(Integer, nullable=False, default=3)

    option = relationship("BridgeOption", back_populates="scores")
    criterion = relationship("StudyCriterion", back_populates="option_scores")


class SwotEntry(Base):
    __tablename__ = "swot_entries"

    id = Column(Integer, primary_key=True, index=True)
    option_id = Column(Integer, ForeignKey("bridge_options.id"), nullable=False, index=True)
    swot_type = Column(String(1), nullable=False)  # S, W, O, T
    title = Column(String(200), nullable=False)
    rating = Column(Integer, nullable=False)  # -3 .. +3
    note = Column(Text, nullable=True)

    option = relationship("BridgeOption", back_populates="swot_entries")
