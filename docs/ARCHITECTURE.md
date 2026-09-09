# Runtime architecture

`src/core/types.ts` defines the authoritative `AgentRun`. `scenarios.ts` provides typed fixtures, tool definitions and an explicit instruction sequence. `runtime.ts` advances a cloned run by one recorded event. Runtime code has no React, Three.js, network or wall-clock dependency.

Execution order: intent → policy → context → scripted decision → search/read tools → extraction decision → calculator → draft → deterministic verification → outcome evaluation → write authorization → human approval → reauthorization → exact commit → audit. Every tool selection is followed by a distinct authorization request/decision, start and result. Failed retryable isolated tools pass through a recorded bounded backoff. Consequential tools are not automatically retried.

`playback.ts` owns immutable run snapshots and a cursor. Forward motion reuses an existing snapshot before considering a new runtime step. Approval is accepted only at the live end. Rewind does not mutate the head or repeat side effects. Reset creates the same deterministic scenario again. These invariants have tests.

React renders one selected snapshot. Lens switching changes presentation only. The topology token identifies `run.zone`; the solid line connects the actual most recent distinct event zones. Dashed routes describe conceptual topology, not asserted event history. Camera and panel state are separate from runtime truth. The scene uses demand rendering, capped pixel density and HTML labels; no frame-based simulation or decorative particles exist.

## Extension points

- **Scenario:** add a `ScenarioDefinition`, controlled fixture variation and explicit program entries. Add a deterministic test for the intended outcome and its forbidden side effects. Do not inject failures only in rendering.
- **Tool:** extend `ToolId`, its `ToolDefinition`, and the deterministic implementation. Declare schemas, permission, exact resource, sandbox class, retry eligibility and input/output handling. Recheck consequential authority in execution, not only in UI.
- **Contract:** add a verifier check with evidence and explicit pass/fail/not-checked semantics; add its required ID to the write precondition and tests.
- **Model adapter:** current `deterministic-script` decisions record context snapshots. Future adapters must produce normalized events without handing control of authorization to model text.

General educational concepts are distinguished from implementation-specific facts. No particular SDK state machine, authentication protocol, inference scheduler or physical hardware topology is reproduced.
