# CLAUDE.md

## Project Philosophy

This is a small personal capture tool for quickly saving thoughts, links, and notes into an Obsidian vault as Markdown files.

Priorities:

1. Fast mobile capture
2. Reliability
3. Simplicity
4. Easy maintenance
5. Low friction

Prefer boring, dependable solutions over clever architecture.

---

## Rules

### 1. Think before coding

State assumptions clearly.
If something is ambiguous, ask instead of guessing.

### 2. Keep solutions simple

Write the minimum maintainable solution.
Avoid abstractions unless they are clearly needed.

### 3. Change only what is necessary

Do not refactor unrelated code unless it blocks the task.

### 4. Define success clearly

Know what success looks like before implementing.
Verify behavior before moving on.

### 5. Read existing code first

Follow existing patterns before introducing new ones.

### 6. Fail loudly

Do not silently skip errors or partial implementations.
Surface uncertainty clearly.

---

## Architecture Preferences

### Capture model

Each capture must create a separate Markdown file.

Never append to a shared inbox file.

### Backend philosophy

Prefer lightweight serverless infrastructure.

Avoid self-hosted backend complexity.

### Mobile UX

Mobile capture speed matters more than feature richness.

Avoid adding friction to the capture flow.

### Security

The frontend may be public.

Write access must remain restricted to the authenticated Google account.

No secrets should exist in the frontend codebase.
