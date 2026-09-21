# ARL in the aserdargun.com learning system

ARL is the shared deterministic execution laboratory for four research perspectives. All lenses inspect the same run; switching lenses does not start a different simulation.

| Foundation | ARL execution view |
| --- | --- |
| [HNS](https://hns.aserdargun.com/en/) | Orchestration, tools, transitions, retries, budgets and observability |
| [CTX](https://ctx.aserdargun.com/en/) | Context assembly, retrieval, provenance, memory policy and state |
| [SEC](https://sec.aserdargun.com/en/) | Identity, delegated purpose, scope, expiry, boundaries and approval |
| [EVL](https://evl.aserdargun.com/en/) | Deterministic verification, evidence and outcome contracts |

## Continue with a related question

| Destination | Learning purpose and boundary |
| --- | --- |
| [MEM](https://mem.aserdargun.com/) | Recall, correction, expiry and deletion with synthetic records and local persistence. ARL's bundled scenarios have empty memory; a link does not share it with MEM. |
| [DPL](https://dpl.aserdargun.com/) | Compare decision policies, evidence requests, approval and abstention. ARL retains its deterministic script; DPL does not control this run. |
| [CUL](https://cul.aserdargun.com/) | Observe, act and verify in a controlled interface simulation. Neither application operates a real desktop. |
| [AOS](https://aos.aserdargun.com/en/) | Explore target agent-runtime architecture and component responsibilities. The public site is explanatory; it does not run AOS, models or external tools in the browser. |

The [portfolio](https://aserdargun.com/) already lists ARL under HNS. Its source registry belongs to the root repository (`data/living-system.json`); ARL's related references belong to `lab.manifest.json`. `src/lessons/ecosystem.ts` resolves those references for the inspector, footer, guide and learning paths. The ILS shell reads the same manifest. HNS, CTX, SEC, EVL and AOS have localized path routes. MEM, DPL and CUL select language in their own UI; no unsupported language query contract is assumed.

## Serving and hardware

ARL's model-call abstraction → [TFL serving](https://tfl.aserdargun.com/?lang=en) → [GEX GPU execution](https://gex.aserdargun.com/gex/anatomy?lang=en) is a conceptual learning path. ARL implements no inference scheduler, KV cache, warp or physical hardware execution. Toward the world, an authorized action changes only the simulated report.

The dedicated **Agent → Serve** link is the one semantic handoff: after a model invocation, it sends a short/long context class and normal priority to a fresh TFL scenario. ARL context units are not token counts. Task text, documents, credentials, approvals and traces never cross this boundary. See [the handoff contract](CROSS-LAB-HANDOFF.md). Ordinary related links carry no run state.

“Intent → agent → token → silicon → action” does not claim a literal single execution sequence or live service integration. Cross-lab trace import and production adapters remain out of scope.
