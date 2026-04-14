# CLAUDE.md

This file provides guidance for AI assistants (Claude Code and others) working in this repository.

## Project Overview

**protogrid** is a newly initialized repository. As of the initial commit, no source code, tooling, or framework has been established. This file will be updated as the project evolves.

- **Repository**: `verknode/protogrid`
- **Default branch**: `main`

## Repository State

The repository currently contains:
- `README.md` — minimal placeholder (`# protogrid`)
- `CLAUDE.md` — this file

No language, framework, build system, or directory structure has been chosen yet.

## Git Workflow

### Branching

- `main` is the protected default branch — do not push directly to it without explicit permission.
- Feature work goes on dedicated branches (e.g., `feature/my-feature`, `fix/my-bugfix`, `claude/task-description`).
- Always check the current branch before starting work: `git branch --show-current`.

### Commits

- Write clear, imperative commit messages (e.g., `Add user authentication module`).
- Keep commits focused — one logical change per commit.
- Never use `--no-verify` to skip hooks unless explicitly instructed.
- Never amend published commits; create new ones instead.

### Pushing

```bash
git push -u origin <branch-name>
```

If a push fails due to a network error, retry up to 4 times with exponential backoff (2s, 4s, 8s, 16s).

### Pull Requests

- Do not create a pull request unless the user explicitly requests one.
- PR titles should be concise (under 70 characters).
- Use the PR body for context, test plans, and links to related issues.

## Development Guidelines (To Be Updated)

These sections are placeholders to be filled in once the project stack is chosen.

### Tech Stack

_Not yet decided. Update this section when languages, frameworks, and tools are selected._

### Directory Structure

_Not yet established. Update this section with the layout once source directories are created._

### Environment Setup

_No environment variables or external services configured yet._

### Running the Project

_No runnable code exists yet. Add build/run/test instructions here._

### Testing

_No test framework chosen yet. Document test commands here when added._

### Code Style & Linting

_No linter or formatter configured yet. Document style rules and commands here when added._

## AI Assistant Conventions

When working in this repository:

1. **Read before editing** — Always read a file before modifying it.
2. **Minimal footprint** — Only create or change files directly required by the task. Do not generate extra documentation, helpers, or boilerplate unless asked.
3. **No speculative abstractions** — Implement exactly what is requested; avoid adding features or refactoring beyond the task scope.
4. **Security** — Never introduce command injection, SQL injection, XSS, hardcoded secrets, or other OWASP Top 10 vulnerabilities. Validate only at system boundaries.
5. **Confirm destructive actions** — Ask before force-pushing, deleting branches, resetting hard, or any action that is difficult to reverse.
6. **Commit hygiene** — Stage specific files by name; avoid `git add -A` unless intentional. Never commit `.env` or credential files.
7. **Branch discipline** — All development work must go on the designated feature branch, not `main`.

## Updating This File

Keep CLAUDE.md current as the project grows. When any of the following change, update the relevant section:

- Tech stack or major dependencies added
- Directory layout established
- Environment variables introduced
- Build, test, or lint commands defined
- CI/CD pipelines configured
- Code style conventions decided
