import {
  txt,
  type AgentRun,
  type PolicyDecision,
  type ToolCall,
} from "./types";
import { tools } from "./scenarios";
export function authorize(run: AgentRun, call: ToolCall): PolicyDecision {
  const tool = tools[call.tool],
    now = run.budget.elapsedMs,
    delegation = run.delegatedAuthority;
  const base = {
    at: now,
    callId: call.id,
    subject: run.identity.id,
    action: tool.permission,
    resource: tool.resource,
    credential: delegation.credential,
  };
  const deny = (en: string, tr: string): PolicyDecision => ({
    ...base,
    decision: "deny",
    reason: txt(en, tr),
  });
  if (
    delegation.subject !== run.identity.id ||
    delegation.purpose !== "quarterly-revenue-update"
  )
    return deny(
      "Identity or delegated purpose does not match",
      "Kimlik veya devredilen amaç eşleşmiyor",
    );
  if (now >= delegation.expiresAt)
    return deny("Delegation expired", "Yetki devri sona erdi");
  if (call.tool === "write_report") {
    if (
      ![
        "latestQuarterFound",
        "previousQuarterFound",
        "sourcesValid",
        "valuesVerified",
        "calculationVerified",
        "statementConsistent",
      ].every((id) =>
        run.evaluations.some((c) => c.id === id && c.status === "pass"),
      ) ||
      run.evaluations.some(
        (c) => c.id !== "writePolicySatisfied" && c.status !== "pass",
      )
    )
      return deny(
        "Evidence contract must pass before write",
        "Yazmadan önce kanıt sözleşmesi geçmeli",
      );
    const approval = run.approvals.find(
      (a) =>
        a.runId === run.id &&
        a.action === tool.permission &&
        a.resource === tool.resource &&
        a.draft === run.state.draft &&
        a.decision === "approveOnce" &&
        !a.consumed &&
        now < a.expiresAt,
    );
    if (!approval)
      return deny(
        "Missing report:write. Human approval required for this exact draft and resource.",
        "report:write eksik. Bu taslak ve kaynak için insan onayı gerekli.",
      );
    return {
      ...base,
      decision: "allow",
      reason: txt(
        "One-use grant for this run, exact draft and report",
        "Bu yürütme, tam taslak ve rapor için tek kullanımlık izin",
      ),
      approvalId: approval.id,
    };
  }
  const permission = delegation.permissions.find(
    (p) =>
      p.action === tool.permission &&
      p.resource === tool.resource &&
      now < p.expiresAt,
  );
  if (!permission)
    return deny(
      `No unexpired permission for ${tool.permission} on ${tool.resource}`,
      `${tool.resource} için geçerli ${tool.permission} izni yok`,
    );
  return {
    ...base,
    decision: "allow",
    reason: txt(
      "Subject, purpose, resource, action and expiry match",
      "Özne, amaç, kaynak, eylem ve süre eşleşiyor",
    ),
  };
}
