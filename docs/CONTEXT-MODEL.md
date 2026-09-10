# Context, memory and state

**Context** is the explicitly assembled information supplied to a particular scripted model invocation. **Memory** is an independently represented set of run-local items admitted only under policy. **State** is the authoritative current workflow condition. Memory is empty in CORE and is never silently inserted.

`assembleContext` uses stable priority selection within a finite synthetic capacity. Every item retains ID, class, content, source, source trust, logical timestamp, inclusion reason, related tool call and unit count. Excluded items remain inspectable with a reason. Policy and user intent have higher priority than retrieval; no unit count is claimed to be a real tokenizer measurement.

Initial assembly includes system boundaries, write policy, user task, expected quarters and budget. Read results add only the documents actually selected by the retrieval path. Calculator output is explicitly marked derived and unverified. Every model call keeps its own complete context snapshot, so later retrieval cannot retroactively change what that call saw.

The normal search returns several candidates, including irrelevant and outdated records. The stale-source scenario chooses an old top result and deliberately assigns it to the requested latest-quarter slot. This is a faulty scripted decision: provenance still says Q1, and the independent verifier rejects the outcome. The missing-source scenario retains a missing result; it does not invent a Q2 value.

The Context overflow scenario reduces capacity to 54 synthetic units. Policy and one retrieved source fit; the other source remains inspectable but excluded. The scripted model cannot use it, so verification stops the run before approval. Reassembly deduplicates policy-inserted memory and removes it when memory inclusion is disabled. Cross-run memory scenarios remain deferred to V2.
