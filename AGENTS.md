# BMAD-METHOD

Open source framework for structured, agent-assisted software delivery.

## Rules

- Use Conventional Commits for every commit.
- Before pushing, run `npm ci && npm run quality` on `HEAD` in the exact checkout you are about to push.
  `quality` mirrors the checks in `.github/workflows/quality.yaml`.

- Skill validation rules are in `tools/skill-validator.md`.
- Deterministic skill checks run via `npm run validate:skills` (included in `quality`).

## File Structure Rules

Adopted from Folder Structure Conventions:
https://github.com/kriasoft/Folder-Structure-Conventions

- Use short lowercase names for top-level folders and files, except `LICENSE` and `README.md`.
- Prefer this top-level layout:
  - `src` for source code (alternatives: `lib` for libraries, `app` for non-compiled app code)
  - `test` for automated tests (alternatives: `tests`, `spec`)
  - `docs` for documentation (alternative: `doc`)
  - `tools` for developer tooling and utilities
  - `build` or `dist` for compiled/distribution artifacts
- Keep tests under a dedicated test root, with clear subfolders such as:
  - `test/unit`
  - `test/integration` (or `test/e2e`)
  - `test/benchmarks` where needed
- Keep documentation under `docs` with focused topic files (for example usage, FAQ, misc, and TOC/index pages).
- Keep third-party dependencies out of source folders; generated artifacts and vendored code should not be mixed with `src`.
- Keep license text at project root in `LICENSE` (or `LICENSE.txt`/`LICENSE.md`).
