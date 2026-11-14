# Repository guide

This repository holds two separate things. Know which one you are touching.

| Path | What it is | Rule |
| --- | --- | --- |
| `website/` | **ADEN-CHASE Strategies corporate website** (Next.js). All current work. | Read `website/CLAUDE.md` before any change. |
| `.claude/skills/premium-web-production/` | Reusable premium web production standard (review sequence, visual verification, brand safety). | Invoke it for any substantial visible change. |
| `.claude/agents/` | Review subagents: `creative-director`, `uiux-designer`, `motion-designer`, `visual-qa-reviewer`, `perf-a11y-reviewer`. | Used by the workflow in `website/CLAUDE.md` §1. |
| everything else (`index.html`, `api/`, `audit/`, `thank-you/`, `og-image.png`, `README.md`) | **AdenChase Labs** static site, deployed from `main`. | Do not modify. |

## Isolation (non-negotiable)

- Never modify, redeploy or migrate the **ADEN-CHASE Client Portal** (`tvchpoint-web/aden-chase-portal`) or the **Dentopia** workspace, and never reuse their credentials, Supabase project or database.
- Never merge into `main`, change production DNS, or promote a deployment to production without explicit approval in the conversation.
- Work on the assigned feature branch; commit and push only there.
