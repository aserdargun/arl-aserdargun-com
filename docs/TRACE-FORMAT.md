# ARL Trace Format v1

The explicit JSON download serializes `{ format: 'arl-trace', version: 1, mode: 'educational-simulation', clock: 'synthetic-ms', run, snapshots, viewedEvent }`.

The run includes identity, delegated authority, context, memory, workflow state, tools, model calls, policy decisions, evidence, checks, approvals and budget. Each event has `id`, `runId`, monotonic `seq`, `at`, `durationMs`, `type`, `zone`, bilingual `title` and `detail`, optional `parentId` and optional structured `data`. Related tool/model/approval IDs support a span hierarchy even when the basic display is chronological. The detailed trace exposes these relations, inputs, outputs and evidence.

Snapshots are the authoritative post-event states. Snapshot 0 is ready; snapshot N contains event N. Event timestamps mark the end of an educational operation. Operation start timestamps may precede that endpoint. Backoff is 500 synthetic milliseconds; default recorded operations are 100 synthetic milliseconds. These are not empirical model/tool latencies.

Playback is not event re-execution. Rewinding and stepping through known snapshots cannot grant authority or repeat a side effect. The current UI perspective and selected cursor are separate from the live run.

No trace importer or external SDK adapter is included. Future import must validate schema/version, preserve unknown evidence and source clocks, distinguish observed traces from simulations, and disable consequential execution of imported history. Raw trace content must never become application instructions. The current export is a diagnostic educational record, not a signed or tamper-proof audit artifact.
