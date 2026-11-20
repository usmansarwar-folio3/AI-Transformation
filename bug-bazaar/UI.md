# UI Development Standards — The Bug Bazaar

These guidelines are **mandatory** whenever creating new UI components or modifying existing ones in this project. Do not apply them to sibling folders such as `bug-bounty-starter/` or `JSPractice/`.

AI coding agents must read this file before implementing or modifying UI components.

The `index.html` document shell (`html`, `body`, and the root mount node) is required for React and is exempt from the “no raw HTML” rule below.

---

## 1. Ant Design Standards

- Use Ant Design components exclusively for UI elements and layout.
- Do not use raw HTML tags such as `div`, `span`, `button`, or `input`.
- Do not use inline CSS or inline styles.
- Always prefer existing Ant Design components over custom implementations.

---

## 2. SCSS Standards

- Follow the BEM (Block Element Modifier) naming methodology.
- Avoid duplicate or repeated SCSS properties.
- Keep styles clean, reusable, and maintainable.
- Do not use hardcoded color values such as `#fff`, `#000`, or `#1677ff` directly in component SCSS files.
- All color variables must be centrally maintained in the `_variables.scss` file (`src/styles/_variables.scss`).
- Use existing SCSS variables instead of introducing duplicate values.
- Avoid unnecessary CSS overrides and excessive nesting.

---

## 3. SCSS File Naming Convention

- Every component must have its own appropriately named SCSS file.
- For example:
  - `Product.tsx` → `product.scss`
  - `Dashboard.tsx` → `dashboard.scss`
  - `UserProfile.tsx` → `user-profile.scss`
- Do not create generic or unnamed SCSS files such as `style.scss`. The stylesheet name must clearly correspond to its parent component.

---

## 4. Ant Design Grid and Responsive Layout

- Always use Ant Design's `Row` and `Col` components for page layouts.
- Do not use `Row` without properly structured `Col` components.
- Always apply appropriate gutter values to `Row`.
- Every `Col` must explicitly cover all standard responsive breakpoints: `xs`, `sm`, `md`, `lg`, `xl`, and `xxl`.
- Do not leave any standard breakpoint undefined.
- Use standard Ant Design breakpoints only. Do not introduce custom breakpoint values.
- If media queries are necessary, define them inside the relevant component selector and CSS property rather than creating disconnected media-query blocks.
- Prefer Ant Design's responsive Grid properties whenever possible.

---

## 5. Theme Customization

For all theme-related changes, follow Ant Design's official Theme Customization approach.

References:

- https://ant.design/theme-editor
- https://ant.design/docs/react/customize-theme/

Requirements:

- Use Ant Design's `ConfigProvider` and Design Tokens for theme customization.
- Centralize all theme-related values in a `themeToken` file (`src/theme/themeToken.ts`).
- Create a separate theme configuration file to manage and apply the theme (`src/theme/themeConfig.ts`).
- Handle global and component-specific theme customizations through Ant Design tokens.
- Avoid unnecessary custom CSS overrides.
- Only write additional CSS when it is genuinely required and cannot be handled through Ant Design's theme customization.
- Ensure SCSS variables remain consistent with the configured theme.

---

## 6. React Code Review

Use the project skill `.cursor/skills/react-review` (also available to Claude via `.claude/skills/react-review`) when reviewing UI or React changes. That skill reviews against this document and senior React engineering standards.

---

## 7. Final Expectations

- This file is the single source of truth for UI development standards in The Bug Bazaar.
- Follow these guidelines consistently across all UI development and code reviews.
- These are mandatory project standards, not optional recommendations.
