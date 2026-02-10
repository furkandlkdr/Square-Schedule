# Memory Bank — Usage

Purpose
- The Memory Bank holds canonical project documentation that must be read at session start.

Required files (core)
- `projectbrief.md`
- `productContext.md`
- `activeContext.md`
- `systemPatterns.md`
- `techContext.md`
- `progress.md`

Daily workflow
1. At session start, read all files in `memory-bank/` in the order above.
2. Update `activeContext.md` and `progress.md` as you make decisions or deliver work.
3. When you trigger **update memory bank**, review every file and record changes.

Guidelines
- Keep entries brief and factual. Prefer bullet points for quick scanning.
- Link to code files, PRs, and issues when recording decisions.

Automation ideas
- Add a pre-commit or dev-server hook that prints a reminder to review `memory-bank/` on new sessions.
