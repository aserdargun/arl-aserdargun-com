# Security model

ARL demonstrates access-control boundaries inside a browser simulator. It is not an enforcement product. Browser users can modify JavaScript; local simulation state is not a tamper-proof security perimeter.

## Authority

Subject `agent-revenue` receives purpose `quarterly-revenue-update` from `human-policy-owner`, with a synthetic credential and logical expiry. Scope matches **both exact permission and exact resource**. Initial scope permits document reads, calculator execution and isolated drafts. Identity is necessary but insufficient; purpose and expiry are also checked.

`report:write` requires all six evidence contract IDs to exist and pass, plus a matching unconsumed `approveOnce` grant. The grant is bound to run ID, action, target report, exact draft and expiry. Broad base scope never bypasses the configured approval requirement. Authorization and current source evidence are rechecked before start and at commit. Source verification binds each unique evidence record to its exact document, revision, quarter, finite value and successful read call; cached passing evaluations do not replace this check. The write consumes its grant atomically with the simulated mutation and refuses repeated writes. Denied actions never invoke a tool side effect. Expired or changed-draft grants fail closed.

Grant expiry uses the simulation clock. Waiting while paused does not consume wall-clock validity. Reset/reload clears the simulated world; no actual external report is modified.

## Untrusted content

Prompt-injection fixtures remain `RETRIEVAL` items with `untrusted` provenance. A deliberately adversarial scripted decision records the malicious context and attempts a notification. The requested send lacks authority, so no message is appended to the synthetic outbox. This demonstrates a boundary even when a decision follows bad text, rather than treating a refusal as access control.

Context labeling, purpose, exact tool scope, isolation, verification and human governance address different concerns. No single filter, sandbox, approval, schema or least-privilege rule is presented as eliminating every risk.

## Governance

HIC is illustrated by the human-authored purpose and policy. HOTL is illustrated by supervised playback, pause and inspection. HITL is the explicit consequential-write decision. These are educational operational patterns that may overlap, not rigid universal definitions.

## Test coverage

Denied write, exact resource/subject match, expired read permission, expired approval at commit, altered draft/run/resource, missing contract requirement, approval reuse, unchanged permanent scope, injection authority preservation, no denied send side effect, and no automatic retry of failed consequential writes are covered by tests.
