### Universal Scenario Analysis Prompt

Use this prompt to describe ANY product scenario in a clear, non-technical, implementation‑agnostic way. Focus strictly on user actions and system reactions.

---

### Overview (plain, non-technical)
- A one‑paragraph summary of what the user wants to achieve and what the system provides, in everyday language.

### Scenario (USER ACTION ⇒ SYSTEM REACTION)
1) [User action] ⇒ [System reaction visible to user].
2) [User action] ⇒ [System reaction visible to user].
3) [User action] ⇒ [System reaction visible to user].
4) [User action] ⇒ [System reaction visible to user].

Rules:
- Always write in pairs: User does → System responds.
- No code, APIs, or internal structures. Only observable behavior.
- Each step is a small, complete action with a clear, visible outcome.

### Preconditions
- Access and permissions that must be true before the scenario starts.
- Any required live/connected sources or baseline data availability.

### Additional Scenarios (USER ACTION ⇒ SYSTEM REACTION)
- Variant flows and behavior under changed conditions (e.g., different filters, states, or toggles).
- Alternative outcomes (success / error / cancel) written in the same action→reaction form.

### Result / Completion
- State at the end of the scenario (e.g., “User sees up‑to‑date data and continues working”, “File is downloaded and user returns to the workspace”).
- The end must be explicit and observable.

---

### Characteristic Signs of a Good Scenario
- **User/System pairs**: Always capture user intention and immediate system feedback.
- **Step granularity**: From entry to final outcome in clear, numbered steps.
- **Variant states**: Describe states without technical UI terms; use neutral nouns (panel, selector, dialog, list).
- **Outcome clarity**: Finish with an explicit, user‑visible result.
- **Optional branches**: Add alternative flows (settings changed, user cancels, errors occur) as separate bullets.
- **Abstraction from implementation**: No mentions of dropdowns/modals/API calls; keep wording stable across redesigns.

---

### Example (for reference)
#### Overview
- The user opens a live dashboard and applies filters; charts and KPIs update smoothly (no flicker).

#### Scenario (USER ACTION ⇒ SYSTEM REACTION)
1) Open the dashboard ⇒ main KPIs and a Filters panel are visible.
2) Choose country and period ⇒ preview updates inline.
3) Click Apply ⇒ charts/KPIs/table recalc to the selection; the URL gains query params.
4) Click Reset (if needed) ⇒ the default view is restored.

#### Preconditions
- The user has access to the dashboard.
- A realtime data source is connected.

#### Additional Scenarios (USER ACTION ⇒ SYSTEM REACTION)
1) Open a dashboard with configurable widgets ⇒ the initial set of charts appears.
2) Dashboard loads base snapshots ⇒ the user sees up‑to‑date values at open time.
3) Subscribe to realtime updates ⇒ new points are smoothly appended to the series.
4) Visualizations update incrementally ⇒ no full re‑renders, no flicker.
5) Switch period/metric ⇒ series are recalculated to match the selection.
6) Save a preset and export charts (PNG/CSV) ⇒ the preset is available later, the file is downloaded.

---

### How to Use
1) Copy the template sections.
2) Fill with concise, user‑visible behavior only.
3) Keep steps numbered and small; add variants under Additional Scenarios.
4) End with a clear Result / Completion statement.



