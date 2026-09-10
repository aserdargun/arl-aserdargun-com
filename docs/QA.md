# CORE acceptance and senior review

Verified locally on 2026-09-09. This is a local implementation acceptance record, not a production release claim.

## Automated verification

`npm run check` passes: **47 tests across three files**, TypeScript checking, and the Vite production build. Tests cover the A–D vertical slice, exact authority scope, grant expiry/reuse, changed drafts, missing contracts, injection boundaries, context selection/provenance/memory policy, independent arithmetic and citation checks, retry bounds, budget exhaustion, deterministic reset and replay without repeated effects.

## Browser acceptance

The actual built `dist/` application was served by Vite preview at `http://127.0.0.1:5191` and exercised through the Codex in-app browser. No Playwright CLI fallback was used. [Structured observations](browser-checks.json) record the scenario stops and viewport checks.

| Scenario | Observed stop | Evidence |
|---|---|---|
| Revenue report | Human approval, event 39 | Q2 120, Q3 150, 25%; six evidence passes, write not checked |
| Approve once | Complete | Exactly one write; grant consumed; base authority unchanged |
| Deny | Action denied | Report remains unchanged |
| Prompt injection | Human approval, event 50 | Untrusted note visible in CTX; external send blocked, outbox empty |
| Bad evidence | Needs review, event 35 | Q1 source mislabeled as Q3 by the faulty decision; arithmetic passes, source/quarter/statement fail |
| Temporary tool failure | Human approval, event 45 | Two bounded retries across the two reads; recovery |
| Persistent timeout | Stopped, event 22 | Three attempts, two retries, then failure |
| Wrong calculation | Needs review, event 35 | 20% tool claim rejected against independent 25% |
| Missing evidence | Needs review, event 35 | Missing Q2 cannot silently become a supported claim |
| Budget exhausted | Stopped, event 20 | Budget threshold prevents the next tool start |

Also checked: Play, Pause, Step, Rewind, Reset, selecting trace events, parent/child span IDs and payload inspection, lens switching with unchanged cursor/time, historical context before retrieval, keyboard arrow navigation between lenses, twelve-chapter lesson navigation, Escape dismissal, source inspection, and the JSON preview.

At 390×844 the Turkish bottom-sheet inspector exposes authority, review and deny actions. The review-to-denial path was exercised. The textual topology exposes every station and current-step text. At widths 320, 390, 768 and 1440, document width remained within the viewport. Desktop visual review used 1600×1000. Initial language preference survives reload; runtime does not persist across reload/reset.

Production browser logs contained no application errors. The Three.js/Fiber dependency emits a `THREE.Clock` deprecation warning; it is not suppressed and did not prevent interaction. A comprehensive automated accessibility audit or cross-browser/device certification is not claimed.

The in-app browser did not expose a completed native download event. To keep export reviewable, the export dialog shows the complete selectable JSON; its parsed format/version and event/snapshot correspondence were verified from visible text. Browser-managed saving remains environment-dependent; native download completion is not claimed.

## One combined senior audit

- **Architecture:** runtime and rendering remain separate; all lenses use one selected snapshot; replay traverses history rather than executing again.
- **Security:** base write authority cannot bypass the human gate; every mandatory contract must exist; grant use is bound and rechecked at commit; denied sends never start.
- **Context:** injection decision records untrusted context before attempting a send; source provenance survives bad retrieval; memory remains separate and policy-controlled.
- **Evaluation:** arithmetic can pass while the outcome fails; untrusted notes never inherit verification from unrelated revenue checks; unchecked authority remains explicit.
- **Education:** model abstraction, synthetic units/time/data, context/memory/state and verification/evaluation/observability distinctions are visible. Governance patterns are described with limitations.
- **Interaction:** mobile uses a bottom sheet, the topology fits the viewport, and review/deny controls stay outside the inspector's scrolling body. 3D routes distinguish conceptual connections from the latest actual event transition.

High-impact findings above were fixed and retested. V2 comparisons, branch-from-event, richer least-privilege/memory scenarios, trace import and platform adapters remain explicitly deferred.

## CORE checklist

- [x] ARL identity and explanatory landing state
- [x] One typed authoritative, event-driven AgentRun
- [x] Revenue task, explicit context/provenance and scripted decisions
- [x] Tool selection, result lifecycle, bounded retries and budgets
- [x] Identity, delegation, authorization and isolated/consequential boundaries
- [x] Independent verification, explicit evaluation contracts and evidence
- [x] Human review with approve-once/deny and one authorized simulated commit
- [x] Synchronized HNS, CTX, SEC and EVL lenses
- [x] Trace, timestamps, payloads, history, Play/Pause/Step/Rewind/Reset
- [x] Injection and bad-evidence scenarios
- [x] Critical deterministic/security tests and actual browser QA
- [x] Bilingual guided learning, keyboard controls and mobile alternative
- [x] Outbound HNS/CTX/SEC/EVL integrations and durable model documentation

GitHub publication, Azure deployment, root-site integration, DNS and `arl.aserdargun.com` live verification were not performed in this implementation task.
