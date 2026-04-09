from app.services.scoring import WeightedCriterion, evaluate_option


def test_reverse_scoring_and_gate_check():
    criteria = [
        WeightedCriterion(category="S", factor_weight=1.0, score_best=8, score_base=7, score_worst=6),
        WeightedCriterion(category="W", factor_weight=1.0, score_best=3, score_base=4, score_worst=5),
        WeightedCriterion(category="O", factor_weight=1.0, score_best=7, score_base=7, score_worst=6),
        WeightedCriterion(category="T", factor_weight=1.0, score_best=3, score_base=4, score_worst=5),
    ]

    result = evaluate_option(
        option_name="Option A",
        criteria=criteria,
        category_weights={"S": 0.3, "W": 0.2, "O": 0.3, "T": 0.2},
        thresholds={"S": 6, "W": 6, "O": 6, "T": 6},
        risk_confidence=0.65,
    )

    assert result.passed_gates
    assert result.risk_adjusted_score > 0
