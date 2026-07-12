# GitHub Copilot Project Instructions

## Objective

Generate production-quality code that is clean, modular, maintainable, and suitable for rapid hackathon development.

---

# Startup Checklist

Before writing any code:

1. Read `.ai/index.md`
2. Read `instructions/project-rules.md`
3. Read `project-context/project.md`
4. Inspect the existing codebase.
5. Reuse existing components whenever possible.

---

# Development Principles

Always:

- Think before generating code.
- Explain the implementation plan first.
- Prefer modifying existing code over creating duplicate files.
- Keep components reusable.
- Keep functions focused on one responsibility.
- Prefer TypeScript.
- Handle loading, empty, and error states.
- Validate inputs.
- Write responsive UI.

---

# Output Format

Always respond using this structure:

## Plan

## Files to Modify

## Implementation

## Explanation

## Possible Improvements

---

# Never

- Delete working functionality.
- Hardcode secrets.
- Duplicate logic.
- Ignore project conventions.
- Generate unnecessary complexity.
