# Reporting

Phase 1 reporting uses markdown as the common source and supports conversion via Quarto/Pandoc.

## Planned commands

```powershell
cd src/reporting/quarto
quarto render ..\..\build\reports\<project>_report.md --to pdf
quarto render ..\..\build\reports\<project>_report.md --to docx
```

DOTX template matching is placeholder-level in Phase 1 and will be polished in Phase 1.1.
