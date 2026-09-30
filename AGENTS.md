# ARL working contract

- Build the bilingual agent runtime laboratory: one revenue-update execution that can be inspected through the HNS, CTX, SEC, and EVL lenses. It is a deterministic educational runtime, not an agent framework and not an integration with any of those systems.
- Keep runtime truth in `src/core`; `src/ils`, `src/lessons` and `src/visualization` present it. Every run is reproducible from its seed, and a replay must reconstruct the same execution.
- A lens observes the run; it never becomes a decision input. A staged fault such as a stale evidence read has to be visible in the trace with its effect, and security refusals must stop the run rather than downgrade it.
- Keep Turkish and English controls, lens text and explanations equivalent. The acceptance record in `docs/QA.md` is dated evidence about a specific build, not a claim about every later one.
- Cite only what a source genuinely supports, and state what it does not support next to it. A citation is concept support, never a certification of this simulator. Leave a claim uncited and visibly uncited rather than attaching a loosely related document, and date only what the repository can show where the date came from.
- Verify `npm run check` and review `git diff --check` before handoff.
- Local work only unless the user authorizes external publication. Preserve unrelated work and processes.
