import { describe, expect, it } from "vitest";
import {
  advance,
  createRun,
  decideApproval,
  runUntilStop,
} from "../src/core/runtime";
import { authorize } from "../src/core/security";
import { assembleContext } from "../src/core/context";
import { growth, verify } from "../src/core/evaluation";
import { getScenario } from "../src/core/scenarios";
import { txt } from "../src/core/types";
describe("Slices A–D: governed revenue execution", () => {
  it("A: retrieves actual sources, calculates and drafts", () => {
    const r = runUntilStop();
    expect(r.state.growth).toBe(25);
    expect(r.state.draft).toContain("150");
    expect(r.evidence.map((e) => e.quarter)).toEqual(["Q3", "Q2"]);
    expect(r.toolCalls.find((c) => c.tool === "calculator")?.output).toEqual({
      growth: 25,
    });
  });
  it("B: cannot write without authority", () => {
    const r = runUntilStop();
    expect(r.status).toBe("awaiting_approval");
    expect(r.state.writeCount).toBe(0);
    expect(r.toolCalls.at(-1)?.status).toBe("denied");
    expect(r.events.some((e) => e.type === "ACTION_COMMITTED")).toBe(false);
  });
  it("C: independently verifies numbers and keeps unchecked policy unchecked", () => {
    const r = runUntilStop();
    expect(r.verification.every((c) => c.status === "pass")).toBe(true);
    expect(r.evaluations.at(-1)?.status).toBe("not_checked");
  });
  it("D: approval permits exactly one intended action and does not expand scope", () => {
    const stopped = runUntilStop(),
      r = runUntilStop(decideApproval(stopped, "approveOnce"));
    expect(r.status).toBe("complete");
    expect(r.state.writeCount).toBe(1);
    expect(r.approvals[0].consumed).toBe(true);
    expect(r.delegatedAuthority.permissions).toEqual(
      stopped.delegatedAuthority.permissions,
    );
    expect(authorize(r, r.toolCalls.at(-1)!).decision).toBe("deny");
    expect(advance(r)).toBe(r);
    expect(decideApproval(r, "approveOnce")).toBe(r);
  });
});
describe("Authority boundaries", () => {
  it("denial leaves report unchanged", () => {
    const r = runUntilStop(),
      d = decideApproval(r, "deny");
    expect(d.status).toBe("denied");
    expect(d.state.report).toBe(createRun().state.report);
    expect(d.state.writeCount).toBe(0);
  });
  it("approval is invalid for a changed draft", () => {
    const r = decideApproval(runUntilStop(), "approveOnce");
    r.state.draft += " changed";
    expect(authorize(r, r.toolCalls.at(-1)!).decision).toBe("deny");
    expect(runUntilStop(r).state.writeCount).toBe(0);
  });
  it("approval is invalid for another run or resource", () => {
    for (const field of ["runId", "resource"] as const) {
      const r = decideApproval(runUntilStop(), "approveOnce");
      r.approvals[0][field] = "different";
      expect(authorize(r, r.toolCalls.at(-1)!).decision).toBe("deny");
    }
  });
  it("expired permission cannot authorize a read", () => {
    const r = runUntilStop();
    const c = r.toolCalls.find((c) => c.tool === "read_document")!;
    r.delegatedAuthority.permissions[0].expiresAt = 0;
    expect(authorize(r, c).decision).toBe("deny");
  });
  it("matches resource and subject exactly", () => {
    const r = runUntilStop(),
      c = r.toolCalls[0];
    r.delegatedAuthority.permissions[0].resource = "other";
    expect(authorize(r, c).decision).toBe("deny");
    r.delegatedAuthority.subject = "intruder";
    expect(authorize(r, c).decision).toBe("deny");
  });
  it("expired approval is rechecked at commit", () => {
    let r = decideApproval(runUntilStop(), "approveOnce");
    while (r.phase !== 4) r = advance(r);
    r.approvals[0].expiresAt = 0;
    r = advance(r);
    expect(r.state.writeCount).toBe(0);
    expect(r.status).toBe("failed");
  });
  it("injection cannot modify authority or produce a send side effect", () => {
    const r = runUntilStop(createRun("injection"));
    expect(
      r.context.items.some(
        (i) => i.id === "malicious" && i.included && i.trust === "untrusted",
      ),
    ).toBe(true);
    expect(
      r.modelCalls.at(-1)?.context.items.some((i) => i.id === "malicious"),
    ).toBe(true);
    expect(r.state.outbox).toEqual([]);
    expect(r.delegatedAuthority.permissions).toEqual(
      createRun().delegatedAuthority.permissions,
    );
    expect(
      r.toolCalls.find((c) => c.tool === "send_notification")?.startedAt,
    ).toBeUndefined();
    expect(r.events.some((e) => e.type === "UNTRUSTED_ACTION_BLOCKED")).toBe(
      true,
    );
  });
});
describe("Context and replay", () => {
  it("includes critical policy, marks exclusions, retains provenance", () => {
    const source = runUntilStop().context.items;
    const c = assembleContext(source, 25, 300);
    expect(c.used).toBeLessThanOrEqual(25);
    expect(c.items.find((i) => i.id === "policy")?.included).toBe(true);
    expect(c.items.find((i) => i.id === "q3")?.exclusion).toBeDefined();
    expect(c.items.find((i) => i.id === "q3")?.toolCall).toBeDefined();
  });
  it("memory is explicitly opt in", () => {
    const m = [{ id: "m", content: txt("prior", "önceki"), purpose: "test" }];
    expect(assembleContext([], 20, 0, m).items).toEqual([]);
    expect(assembleContext([], 20, 0, m, true).items[0].kind).toBe("MEMORY");
  });
  it("historical snapshots never mutate and reset is deterministic", () => {
    let r = createRun();
    const history = [r];
    for (let i = 0; i < 30; i++) {
      r = advance(r);
      history.push(r);
    }
    expect(history[0]).toEqual(createRun());
    expect(history[4].evidence).toEqual([]);
    expect(JSON.stringify(runUntilStop())).toBe(
      JSON.stringify(runUntilStop(createRun())),
    );
  });
  it("events have contiguous order, monotonic time and start before completion", () => {
    const r = runUntilStop();
    expect(r.events.map((e) => e.seq)).toEqual(r.events.map((_, i) => i + 1));
    expect(r.events.every((e, i) => i === 0 || e.at > r.events[i - 1].at)).toBe(
      true,
    );
    for (const c of r.toolCalls.filter((c) => c.status === "succeeded"))
      expect(c.completedAt).toBeGreaterThan(c.startedAt!);
  });
});
describe("Verification, failures and bounded autonomy", () => {
  it("correct formula, zero base and nonfinite inputs", () => {
    expect(growth(120, 150)).toBe(25);
    expect(growth(0, 10)).toBeUndefined();
    expect(growth(NaN, 150)).toBeUndefined();
  });
  it.each(["bad-evidence", "calculation", "missing"])(
    "%s fails appropriate contract and blocks approval",
    (id) => {
      const r = runUntilStop(createRun(id));
      expect(r.status).toBe("needs_review");
      expect(r.verification.some((c) => c.status === "fail")).toBe(true);
      expect(r.approvals).toHaveLength(0);
      expect(r.state.writeCount).toBe(0);
    },
  );
  it("tampered output fails statement consistency", () => {
    const r = runUntilStop();
    r.state.draft = "Revenue increased 18%";
    expect(
      verify(r, getScenario("revenue")).find(
        (c) => c.id === "statementConsistent",
      )?.status,
    ).toBe("fail");
  });
  it("wrong arithmetic is independently detected", () => {
    const r = runUntilStop(createRun("calculation"));
    expect(
      r.verification.find((c) => c.id === "calculationVerified")?.status,
    ).toBe("fail");
    expect(
      r.verification.find((c) => c.id === "calculationVerified")?.detail.en,
    ).toContain("Expected: 25");
  });
  it("successful retry terminates retry loop", () => {
    const r = runUntilStop(createRun("retry"));
    expect(r.status).toBe("awaiting_approval");
    expect(r.budget.retries).toBe(2);
    expect(
      r.toolCalls
        .filter((c) => c.tool === "read_document")
        .every((c) => c.attempt === 2),
    ).toBe(true);
  });
  it("permanent read timeout stops at retry bound", () => {
    const r = runUntilStop(createRun("timeout"));
    expect(r.status).toBe("failed");
    expect(r.budget.retries).toBe(2);
    expect(r.toolCalls.at(-1)?.attempt).toBe(3);
  });
  it("side effect failures are not retried", () => {
    let r = decideApproval(runUntilStop(), "approveOnce");
    while (r.phase !== 4) r = advance(r);
    r.state.writeCount = 1;
    r = advance(r);
    expect(r.status).toBe("failed");
    expect(r.pendingRetry).toBe(false);
    expect(r.budget.retries).toBe(0);
  });
  it("budget exhaustion stops before next tool starts", () => {
    const r = runUntilStop(createRun("budget"));
    expect(r.status).toBe("failed");
    expect(r.budget.used).toBe(3);
    expect(r.events.at(-1)?.type).toBe("BUDGET_EXCEEDED");
  });
});
it("missing contract requirements cannot be treated as passed", () => {
  const r = decideApproval(runUntilStop(), "approveOnce");
  r.evaluations = r.evaluations.filter((c) => c.id !== "sourcesValid");
  expect(authorize(r, r.toolCalls.at(-1)!).decision).toBe("deny");
});
it("stale retrieval can yield valid arithmetic but invalid outcome evidence", () => {
  const r = runUntilStop(createRun("bad-evidence"));
  expect(r.state.draft).toContain("Q3 revenue: 100");
  expect(
    r.verification.find((c) => c.id === "calculationVerified")?.status,
  ).toBe("pass");
  expect(
    r.verification.find((c) => c.id === "latestQuarterFound")?.status,
  ).toBe("fail");
  expect(r.verification.find((c) => c.id === "valuesVerified")?.status).toBe(
    "fail",
  );
  expect(r.state.writeCount).toBe(0);
});
it("untrusted note is never marked verified merely because the revenue checks pass", () => {
  const r = runUntilStop(createRun("injection"));
  expect(
    r.toolCalls.find((c) => c.input.documentId === "malicious")?.verification,
  ).toBe("not_checked");
});
it("the injection decision captures untrusted context before the blocked send", () => {
  const r = runUntilStop(createRun("injection"));
  const model = r.modelCalls.find((m) =>
    m.decision.en.includes("Adversarial"),
  )!;
  expect(model.context.items.find((i) => i.id === "malicious")?.trust).toBe(
    "untrusted",
  );
  expect(model.startedAt).toBeLessThan(
    r.toolCalls.find((c) => c.tool === "send_notification")!.selectedAt,
  );
});

describe("Review regressions: evidence and audit integrity", () => {
  it.each(["value", "quarter", "callId"] as const)(
    "rejects tampered evidence %s",
    (field) => {
      const r = runUntilStop();
      if (field === "value") r.evidence[0].value = 999;
      else r.evidence[0][field] = "forged";
      expect(
        verify(r, getScenario("revenue")).find((c) => c.id === "sourcesValid")
          ?.status,
      ).toBe("fail");
    },
  );
  it("rechecks source evidence at the write boundary even after approval", () => {
    let r = decideApproval(runUntilStop(), "approveOnce");
    while (r.phase !== 4) r = advance(r);
    r.evidence[0].revision = "changed-after-review";
    r = advance(r);
    expect(r.state.writeCount).toBe(0);
    expect(r.status).toBe("failed");
  });
  it("never rewrites approval events when a grant is decided or consumed", () => {
    const pending = runUntilStop();
    const request = pending.events.find(
      (e) => e.type === "APPROVAL_REQUESTED",
    )!;
    const approved = decideApproval(pending, "approveOnce");
    const grant = approved.events.find((e) => e.type === "APPROVAL_GRANTED")!;
    const complete = runUntilStop(approved);
    expect(complete.events.find((e) => e.id === request.id)).toEqual(request);
    expect(complete.events.find((e) => e.id === grant.id)).toEqual(grant);
  });
  it("rejects overflowed arithmetic instead of returning infinity", () => {
    expect(growth(Number.MIN_VALUE, Number.MAX_VALUE)).toBeUndefined();
  });
  it("context overflow excludes evidence and stops before approval", () => {
    const r = runUntilStop(createRun("overflow"));
    expect(r.scenarioId).toBe("overflow");
    expect(r.status).toBe("needs_review");
    expect(
      r.context.items.some((i) => i.kind === "RETRIEVAL" && !i.included),
    ).toBe(true);
    expect(r.approvals).toHaveLength(0);
    expect(r.state.writeCount).toBe(0);
  });
  it("reassembling memory neither duplicates it nor retains it after opt out", () => {
    const memory = [
      { id: "memory-1", content: txt("Prior", "Önceki"), purpose: "format" },
    ];
    const first = assembleContext([], 100, 0, memory, true);
    const next = assembleContext(first.items, 100, 1, memory, true);
    expect(next.items).toHaveLength(1);
    expect(next.used).toBe(8);
    expect(
      assembleContext(next.items, 100, 2, memory, false).items,
    ).toHaveLength(0);
  });
});

it("does not offer a fresh approval to repair an expired delegation", () => {
  let r = decideApproval(runUntilStop(), "approveOnce");
  r.delegatedAuthority.expiresAt = 0;
  r = runUntilStop(r);
  expect(r.status).toBe("failed");
  expect(r.approvals).toHaveLength(1);
  expect(r.state.writeCount).toBe(0);
});
it("expired pending approval stops explicitly without accepting it", () => {
  const r = runUntilStop();
  r.approvals[0].expiresAt = 0;
  const next = decideApproval(r, "approveOnce");
  expect(next.status).toBe("failed");
  expect(next.approvals[0].decision).toBe("pending");
  expect(next.events.at(-1)?.type).toBe("APPROVAL_INVALID");
});
it("changed tool input cannot use a grant for a different draft", () => {
  const r = decideApproval(runUntilStop(), "approveOnce");
  r.toolCalls.at(-1)!.input.draft = "substituted content";
  expect(authorize(r, r.toolCalls.at(-1)!).decision).toBe("deny");
});
it("retry and injection preserve every previously recorded event", () => {
  for (const id of ["revenue", "retry", "injection"]) {
    let r = createRun(id);
    for (let i = 0; i < 100; i++) {
      const next = advance(r);
      expect(next.events.slice(0, r.events.length)).toEqual(r.events);
      if (r === next) break;
      r = next;
    }
  }
});

it("rechecks read permission before returning protected content", () => {
  let r = createRun();
  while (!(r.phase === 4 && r.toolCalls.at(-1)?.tool === "read_document"))
    r = advance(r);
  r.delegatedAuthority.permissions[0].expiresAt = 0;
  r = advance(r);
  expect(r.status).toBe("failed");
  expect(r.evidence).toHaveLength(0);
  expect(r.toolCalls.at(-1)?.status).toBe("denied");
  expect(r.pendingRetry).toBe(false);
});
it("a new retry clears the previous output while retaining the failure event", () => {
  let r = createRun("retry");
  while (!r.pendingRetry) r = advance(r);
  const failure = r.events.at(-1)!;
  r = advance(advance(r));
  expect(r.toolCalls.at(-1)?.status).toBe("running");
  expect(r.toolCalls.at(-1)?.output).toBeUndefined();
  expect(r.toolCalls.at(-1)?.completedAt).toBeUndefined();
  expect(r.events.find((e) => e.id === failure.id)).toEqual(failure);
});
it("model extraction uses its captured context even if live assembly changes", () => {
  let r = createRun();
  while (
    !(r.events.at(-1)?.type === "MODEL_CALL_STARTED" && r.evidence.length === 2)
  )
    r = advance(r);
  r.context.items = r.context.items.map((i) => ({ ...i, included: false }));
  r = advance(r);
  expect(r.state.values).toHaveLength(2);
});
