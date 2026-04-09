from pathlib import Path
import subprocess

from app.schemas.reporting import ReportRequest


def _safe_name(value: str) -> str:
    return "".join(ch if ch.isalnum() or ch in ("-", "_") else "_" for ch in value).strip("_")


def render_report_markdown(payload: ReportRequest, output_dir: Path) -> Path:
    output_dir.mkdir(parents=True, exist_ok=True)
    file_name = f"{_safe_name(payload.project_name)}_report.md"
    report_path = output_dir / file_name

    ranking_rows = "\n".join(
        [
            f"| {r.option_name} | {r.risk_adjusted_score:.2f} | {r.expected_score:.2f} | {'Pass' if r.passed_gates else 'Fail'} |"
            for r in payload.ranking
        ]
    )
    assumptions_block = "\n".join([f"- {item}" for item in payload.assumptions])

    text = f"""---
title: \"{payload.project_name} - Weighted SWOT Report\"
format:
  pdf: default
  docx: default
---

# Executive Summary

{payload.executive_summary}

# Decision Outcome

- Winner: {payload.winner or 'None'}
- Loser: {payload.loser or 'None'}

# Option Ranking

| Option | Risk-Adjusted Score | Expected Score | Gate |
|---|---:|---:|---|
{ranking_rows}

# Assumptions

{assumptions_block}

# Template Mapping Note

This Phase 1 report is placeholder-mapped for DOTX formatting alignment.
"""

    report_path.write_text(text, encoding="utf-8")
    return report_path


def markdown_to_latex_placeholder(markdown_path: Path) -> Path:
    latex_path = markdown_path.with_suffix(".tex")
    latex_path.write_text(
        "% Placeholder LaTeX output. Use Quarto/Pandoc to render polished PDF in Phase 1.1\n"
        + "% Source markdown: "
        + str(markdown_path)
        + "\n",
        encoding="utf-8",
    )
    return latex_path


def try_render_with_quarto(markdown_path: Path, dotx_template: Path) -> dict:
    pdf_path = markdown_path.with_suffix(".pdf")
    docx_path = markdown_path.with_suffix(".docx")

    try:
        subprocess.run(
            ["quarto", "render", str(markdown_path), "--to", "pdf"],
            check=True,
            capture_output=True,
            text=True,
        )
        subprocess.run(
            [
                "quarto",
                "render",
                str(markdown_path),
                "--to",
                "docx",
                "--output",
                str(docx_path.name),
                "--metadata",
                f"reference-doc={dotx_template}",
            ],
            check=True,
            capture_output=True,
            text=True,
        )
        return {
            "status": "rendered",
            "pdf_path": str(pdf_path if pdf_path.exists() else markdown_path.with_suffix(".pdf")),
            "docx_path": str(docx_path if docx_path.exists() else markdown_path.with_suffix(".docx")),
        }
    except (subprocess.CalledProcessError, FileNotFoundError):
        return {
            "status": "quarto-unavailable-or-render-failed",
            "pdf_path": None,
            "docx_path": None,
        }
