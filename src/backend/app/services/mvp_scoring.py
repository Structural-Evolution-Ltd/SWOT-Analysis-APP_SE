from dataclasses import dataclass


@dataclass
class CriterionScoreInput:
    weight: float
    direction: str
    raw_score: int


def normalize_score(raw_score: int, direction: str) -> float:
    if direction == "lower_better":
        return (6 - raw_score) / 5
    return raw_score / 5


def weighted_criterion_score(weight: float, raw_score: int, direction: str) -> float:
    return weight * normalize_score(raw_score, direction)


def weighted_option_score(criteria: list[CriterionScoreInput]) -> float:
    return sum(weighted_criterion_score(c.weight, c.raw_score, c.direction) for c in criteria)


def swot_net_score(swot_ratings: list[int]) -> int:
    return int(sum(swot_ratings))


def combined_score(weighted_score: float, swot_net: int) -> float:
    return (weighted_score * 100) + swot_net
