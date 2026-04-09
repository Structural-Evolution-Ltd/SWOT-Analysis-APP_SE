from dataclasses import dataclass
from typing import Iterable


REVERSE_CATEGORIES = {"W", "T"}


@dataclass
class WeightedCriterion:
    category: str
    factor_weight: float
    score_best: float
    score_base: float
    score_worst: float


@dataclass
class OptionEvaluation:
    option_name: str
    expected_score: float
    risk_adjusted_score: float
    category_scores: dict[str, float]
    passed_gates: bool
    gate_failures: list[str]


def _normalize(score: float, reverse: bool) -> float:
    scaled = (score - 1.0) / 9.0
    if reverse:
        return 1.0 - scaled
    return scaled


def _criterion_weighted_value(c: WeightedCriterion, risk_confidence: float) -> tuple[float, float]:
    reverse = c.category in REVERSE_CATEGORIES
    best = _normalize(c.score_best, reverse)
    base = _normalize(c.score_base, reverse)
    worst = _normalize(c.score_worst, reverse)

    expected = (best + 4.0 * base + worst) / 6.0
    spread_penalty = max(0.0, (best - worst)) * (1.0 - risk_confidence)
    risk_adjusted = max(0.0, expected - spread_penalty)

    return expected * c.factor_weight, risk_adjusted * c.factor_weight


def evaluate_option(
    option_name: str,
    criteria: Iterable[WeightedCriterion],
    category_weights: dict[str, float],
    thresholds: dict[str, float],
    risk_confidence: float,
) -> OptionEvaluation:
    by_category_expected: dict[str, float] = {"S": 0.0, "W": 0.0, "O": 0.0, "T": 0.0}
    by_category_risk: dict[str, float] = {"S": 0.0, "W": 0.0, "O": 0.0, "T": 0.0}
    by_category_weight: dict[str, float] = {"S": 0.0, "W": 0.0, "O": 0.0, "T": 0.0}

    for c in criteria:
        expected, risk_adjusted = _criterion_weighted_value(c, risk_confidence)
        by_category_expected[c.category] += expected
        by_category_risk[c.category] += risk_adjusted
        by_category_weight[c.category] += c.factor_weight

    category_scores: dict[str, float] = {}
    expected_total = 0.0
    risk_total = 0.0
    gate_failures: list[str] = []

    for category in ["S", "W", "O", "T"]:
        denom = by_category_weight[category] if by_category_weight[category] > 0 else 1.0
        category_mean = by_category_risk[category] / denom
        category_scores[category] = round(category_mean * 10.0, 3)

        expected_component = (by_category_expected[category] / denom) * category_weights.get(category, 0.0)
        risk_component = (by_category_risk[category] / denom) * category_weights.get(category, 0.0)
        expected_total += expected_component
        risk_total += risk_component

        threshold = thresholds.get(category)
        if threshold is not None and category_scores[category] < threshold:
            gate_failures.append(f"{category}<{threshold}")

    return OptionEvaluation(
        option_name=option_name,
        expected_score=round(expected_total * 10.0, 3),
        risk_adjusted_score=round(risk_total * 10.0, 3),
        category_scores=category_scores,
        passed_gates=len(gate_failures) == 0,
        gate_failures=gate_failures,
    )


def rank_options(evaluations: list[OptionEvaluation]) -> list[OptionEvaluation]:
    return sorted(
        evaluations,
        key=lambda e: (e.passed_gates, e.risk_adjusted_score, e.expected_score),
        reverse=True,
    )
