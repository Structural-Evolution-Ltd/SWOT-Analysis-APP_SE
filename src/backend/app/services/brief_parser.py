from collections import defaultdict
import re


def _normalize(text: str) -> str:
    return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9\s]", " ", text.lower())).strip()


def _keyword_match(normalized_brief: str, keyword: str) -> bool:
    norm_keyword = _normalize(keyword)
    if not norm_keyword:
        return False
    return norm_keyword in normalized_brief


def _generated_from_brief(normalized_brief: str, next_id_start: int) -> list[dict]:
    generated: list[dict] = []
    next_id = next_id_start

    if any(token in normalized_brief for token in ["wide load", "abnormal load", "permit", "escort"]):
        generated.append(
            {
                "id": next_id,
                "title": "Abnormal load permitting and escort complexity",
                "category": "T",
                "default_weight": 1.2,
                "prompt_keywords": "abnormal load,permit,escort,wide load",
            }
        )
        next_id += 1

    if any(token in normalized_brief for token in ["split", "modular", "transport", "haulage"]):
        generated.append(
            {
                "id": next_id,
                "title": "Modular split strategy transport opportunity",
                "category": "O",
                "default_weight": 1.0,
                "prompt_keywords": "split,modular,transport,haulage",
            }
        )
        next_id += 1

    if any(token in normalized_brief for token in ["install", "closure", "programme", "possession"]):
        generated.append(
            {
                "id": next_id,
                "title": "Installation window and possession efficiency",
                "category": "S",
                "default_weight": 1.1,
                "prompt_keywords": "install,closure,programme,possession",
            }
        )

    return generated


def suggest_criteria_from_brief(brief: str, templates: list[dict]) -> dict[str, list[dict]]:
    lower_brief = _normalize(brief)
    grouped: dict[str, list[dict]] = defaultdict(list)
    matched_titles: set[str] = set()

    for item in templates:
        keywords = [k.strip() for k in item.get("prompt_keywords", "").split(",") if k.strip()]
        if any(_keyword_match(lower_brief, keyword) for keyword in keywords):
            grouped[item["category"]].append(item)
            matched_titles.add(item["title"])

    generated_items = _generated_from_brief(lower_brief, next_id_start=100000)
    for item in generated_items:
        if item["title"] not in matched_titles:
            grouped[item["category"]].append(item)

    for category in ["S", "W", "O", "T"]:
        grouped[category] = grouped.get(category, [])

    return grouped
