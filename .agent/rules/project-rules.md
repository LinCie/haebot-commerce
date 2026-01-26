---
trigger: always_on
---

Antigravity AI Project Setup Rules (Astro + React + Tailwind + Bun)

Scope
These rules cover only project setup workflow and MCP usage for this e-commerce Astro project using React and Tailwind, with Bun as the only package manager/runtime. Other concerns (a11y, coding style, decision rules) are defined elsewhere and are out of scope here.

Project setup rules (Bun-only)

1. Bun is mandatory

- All install, run, and tooling commands must use Bun.
- Allowed: bun, bunx, bun run <script>, bun add, bun remove
- Forbidden: any npm, npx, yarn, pnpm commands (no exceptions)

2. Running the project

- Always run scripts through Bun:
  - bun run dev
  - bun run build
  - bun run preview

- If the repo uses different script names, use the exact script names from the project configuration, but still run them via bun run.

3. Managing dependencies

- Add dependencies: bun add <package>
- Remove dependencies: bun remove <package>
- Use bunx for one-off executables: bunx <tool>
- Do not suggest lockfile conversions or alternative package managers.

4. Project consistency

- Do not introduce new tooling, frameworks, or build systems unless the repo already uses them.
- Prefer existing scripts and established setup conventions found in the repository.

MCP rules (required)

1. Context7 MCP (non-negotiable)

- The AI must use Context7 MCP before giving any answer or writing any code.
- Context7 should be used to load and follow:
  - current project structure and conventions
  - existing scripts/commands
  - existing patterns used in Astro/React/Tailwind setup

- If Context7 cannot be used, the AI must not guess; it must clearly state what setup details are missing.

2. Sequential Thinking MCP

- Use when the task is complex, multi-step, or has multiple valid approaches (setup refactors, environment changes, build/dev issues, or broad changes affecting many files).
- The AI should produce a clear, step-by-step plan after Context7 and before proposing impactful setup changes.

3. Shadcn MCP

- Always use when working with shadcn/ui in any way (installing, updating, adding components, or modifying shadcn component usage).
- Do not attempt shadcn steps from memory; follow the repo’s established shadcn approach as confirmed via Context7 and Shadcn MCP.

4. Fetch MCP

- Use whenever content is needed from a URL (docs, examples, references, copied snippets).
- Do not rely on memory for URL-based or version-sensitive details when Fetch can retrieve the source.

5. Git MCP

- Use only for git-related tasks (diff review, change summaries, commit guidance, branch/PR context).
- Do not use git command line unless it is truly required and explicitly justified.

MCP invocation order

1. Context7 first (always)
2. Then use the relevant MCP(s):

- Sequential Thinking for complex setup work
- Shadcn for shadcn-related tasks
- Fetch for URL content
- Git for git tasks

Hard enforcement reminders

- No answers or code before Context7.
- No npm/npx/yarn/pnpm commands.
- Use the specialized MCP whenever its domain applies (Shadcn, Fetch, Git).
