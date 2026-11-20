---
name: react-review
description: >
  Senior React engineer code review for The Bug Bazaar. Use when reviewing
  React components, hooks, TypeScript UI, Ant Design usage, SCSS/BEM,
  responsive layout, PRs, or when the user asks for a React or UI review.
  Reads UI.md first and verifies adherence to project UI standards.
---

# React Review Skill

Act as a Senior React Engineer reviewing changes in this project (The Bug Bazaar).

## Before reviewing

1. Read `UI.md` in this project root. Those rules are mandatory for UI work.
2. Review this app’s source unless the user names another path. Do not restyle sibling projects such as `bug-bounty-starter/`.
3. Inspect the files under review and their neighboring modules before commenting.

## Review checklist

Cover each area that applies to the diff:

1. **React best practices and component architecture** — single responsibility, composition, clear props.
2. **Hooks usage and dependency management** — correct dependency arrays, cleanup, no stale closures.
3. **State management and unnecessary re-renders** — local vs global vs server state; avoid redundant state.
4. **Performance and optimization** — memoization only where measured; list virtualization when needed.
5. **TypeScript standards and type safety** — no `any`, no `@ts-ignore`, narrow unions, typed props.
6. **Code readability and maintainability** — names, structure, dead code.
7. **Accessibility** — keyboard, labels, announced errors, semantic Ant Design usage.
8. **Error handling** — typed API errors, no raw error strings on screen, retry where required.
9. **Ant Design compliance** — components only (no raw `div`/`span`/`button`/`input` in component TSX), no inline styles, prefer existing Ant Design primitives.
10. **SCSS, BEM, and responsive design** — one SCSS file per component, BEM names, colors from `_variables.scss`, `Row`/`Col` with gutter and all breakpoints `xs`–`xxl`.
11. **Theme** — tokens via `themeToken.ts` / `themeConfig.ts` / `ConfigProvider`; SCSS variables aligned with tokens.
12. **Overall adherence to `UI.md`**.

Also check project rules from `CLAUDE.md` when relevant: typed API client only, prices in cents until display, no secrets in `VITE_*`, auth token not in `localStorage`.

## Finding format

For each issue:

- **What**: concrete location (file and symbol or line range).
- **Why it matters**: impact on correctness, a11y, security, performance, or score.
- **Change**: specific improvement or code-level suggestion.

Separate blocking issues from nits. Include at least one strength when reviewing a PR.

## After fixes

When the author says fixes are in, re-read the changed files and verify each prior finding is resolved or explicitly deferred with a reason.
