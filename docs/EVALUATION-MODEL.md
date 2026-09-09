# Evidence before action

Verification is deterministic and independent from the tool result. Six checks cover:

1. The latest source is Q3 in this controlled collection.
2. The previous source is Q2.
3. Source records exist with matching revisions and trusted source labels.
4. Extracted numbers and quarter labels match their source records.
5. Calculator output matches `(latest − previous) / previous × 100` with finite, nonzero-base inputs.
6. The entire draft statement and both citations match independently verified values.

Each produces `pass`, `fail`, `not_checked` or `warning`, retaining evidence references and explanation. There is no aggregate magic score. Tool verification is per-result: a calculator may be arithmetically correct while its inputs refer to the wrong quarter; an untrusted note remains not checked.

Outcome evaluation applies the revenue-update contract to the verification findings. Any evidence failure ends the run in `needs_review` before write approval. The write-authority requirement remains **not checked** until an explicitly approved commit. The event `EVALUATION_PASSED` means the draft evidence stage passed; the UI explicitly states human authority is still required. Final run completion requires the actual write and audit.

The wrong-calculation fixture returns 20% while independent arithmetic expects 25%. The bad-evidence fixture produces mathematically valid arithmetic on a stale source, yet fails source/quarter consistency. The missing-evidence fixture leaves the value and claim unknown. A source citation alone is insufficient without matching content and quarter.

A comprehensive external fact-checker, financial reporting standard, platform benchmark or real-company assurance claim is not included.
