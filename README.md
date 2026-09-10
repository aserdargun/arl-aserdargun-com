# ARL — Agent Runtime Laboratory

**See what happens between intent and action.**

ARL is a bilingual, deterministic educational agent runtime. A single revenue-update execution can be inspected through **HNS / Harness**, **CTX / Context**, **SEC / Security**, and **EVL / Evaluation**. The intended custom domain is `arl.aserdargun.com`; custom-domain binding is separate from the Azure-generated production hostname.

## Run

Node.js 22. Install with `npm ci`, then `npm run dev`. The checkout uses `http://127.0.0.1:5191` with a strict port: it never takes over another process. `npm run build` produces `dist/`; `npm run preview` serves the artifact on the same port after stopping this checkout's dev server.

`npm test` runs the deterministic runtime, security, context, evaluation and replay tests. `npm run check` runs these tests and the production build. CI runs the same checks. Browser acceptance was exercised in the Codex in-app browser; see [QA](docs/QA.md).

## Try the defining experience

1. Play **Revenue report**. The scripted agent reads Q2=120 and Q3=150, calculates 25%, and prepares a cited draft.
2. Switch lenses while paused. The run, event cursor, context and evidence stay the same.
3. At the write boundary, inspect the missing `report:write` authority. The report remains unchanged.
4. Select **Review action → Approve once**. The exact draft is written once into the simulated report. Permanent scope stays unchanged. Denial stops without writing.
5. Rewind to inspect history. Replay never re-executes recorded side effects.
6. Run **Prompt injection** or **Bad evidence**. Inspect the unauthorized send attempt or the stale quarter that invalidates otherwise correct arithmetic.

Additional controlled scenarios exercise temporary failures, persistent timeouts, incorrect calculation, missing evidence and budget exhaustion. The twelve-chapter **Agent Runtime 101** guide introduces each boundary. Mobile uses a single viewport with a bottom-sheet inspector. A textual topology is available without relying on the 3D representation.

## Explicit boundaries

- This is a general educational abstraction, not an implementation of a vendor SDK, MCP, production sandbox, identity provider or security product.
- Model decisions are deterministic scripts. There is no LLM API, live company data, external write, notification service, account, analytics or remote telemetry.
- Document filenames ending in `.pdf` identify structured synthetic fixtures; ARL does not claim to parse PDF files.
- The report is authoritative **inside the simulated world**. It persists across steps in a run, not across reload/reset. Only the language preference is saved in browser storage. JSON export is an explicit local download.
- Time, context capacity, and execution units are synthetic. One unit is charged per model call or tool attempt. These are not measured latency, token limits, currency cost, or platform benchmarks.
- A successful tool call does not verify its result. Verification, outcome evaluation and authority remain separate. An untrusted note is not marked verified when unrelated revenue checks pass.
- One-use human approval is tied to the run, exact draft, resource, action and logical expiry. It does not prove universal safety.

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Security model](docs/SECURITY-MODEL.md)
- [Context model](docs/CONTEXT-MODEL.md)
- [Evaluation model](docs/EVALUATION-MODEL.md)
- [Trace format](docs/TRACE-FORMAT.md)
- [Ecosystem integrations](docs/INTEGRATIONS.md)
- [Acceptance and senior review](docs/QA.md)
- [Visual reference and fidelity decisions](docs/design/REVIEW.md)

V2 comparisons, branching, richer memory/least-privilege labs and trace imports are deferred. No external adapters or multi-agent features are included in CORE.

## Azure publication

The public repository is `aserdargun/arl-aserdargun-com`. The `main` branch deploys through `.github/workflows/deploy-swa-arl-aserdargun-com.yml` to `swa-arl-aserdargun-com`, resource group `rg-arl-aserdargun-com`, in West Europe on the Free SKU under `aserdargun subscription 3`. The workflow uses immutable official action revisions and the prebuilt, verified `dist/` artifact; Azure does not generate a separate source workflow.

`release.json` records the Git SHA and SHA-256 hashes of all deployed artifact files. `npm run verify:artifact` checks this manifest against the local build. Production releases are verified against GitHub Actions, Azure environment readiness, live manifest/asset hashes and browser behavior. Custom-domain and DNS configuration are not part of this workflow.

## ILS compatibility

The committed canonical ILS 0.1 archives in `vendor/` supply shared contracts, controls and inspectable provenance. The manifest describes the existing eight scenarios; Agent Runtime 101 is adapted directly from the twelve existing chapters. Evidence distinguishes simulated traces from calculated checks. Real-world verification and authority are never inferred from successful simulated execution.

Use `?scenario=<existing-id>`, `?lesson=agent-runtime-101` and `?lang=en|tr` to open existing content. Unsupported `ils` payloads are ignored; no cross-lab runtime state or arbitrary return URL is accepted. Play/pause, step, rewind and reset retain their original callbacks, replay semantics and authority gates. `lab.manifest.json` is included before release hashes are generated. No ILS sibling checkout is required for installation or deployment.
