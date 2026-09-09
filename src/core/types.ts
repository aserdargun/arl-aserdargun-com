export type Locale = "en" | "tr";
export type Copy = Record<Locale, string>;
export const txt = (en: string, tr: string): Copy => ({ en, tr });
export type Lens = "hns" | "ctx" | "sec" | "evl";
export type Zone =
  | "intent"
  | "context"
  | "model"
  | "router"
  | "authority"
  | "sandbox"
  | "verify"
  | "evaluate"
  | "approval"
  | "world"
  | "audit";
export type Fault =
  | "none"
  | "injection"
  | "stale"
  | "retry"
  | "timeout"
  | "calculation"
  | "missing"
  | "overflow"
  | "budget";
export type PermissionName =
  | "documents:read"
  | "calculator:execute"
  | "report:draft"
  | "report:write"
  | "notification:send";
export interface Permission {
  action: PermissionName;
  resource: string;
  expiresAt: number;
}
export interface AgentIdentity {
  id: string;
  label: string;
}
export interface Delegation {
  subject: string;
  issuer: string;
  purpose: string;
  credential: string;
  expiresAt: number;
  permissions: Permission[];
}
export interface Document {
  id: string;
  title: string;
  quarter?: string;
  revenue?: number;
  content: Copy;
  trust: "source" | "untrusted";
  revision: string;
}
export type ContextKind =
  | "SYSTEM"
  | "POLICY"
  | "USER"
  | "TASK"
  | "RETRIEVAL"
  | "MEMORY"
  | "TOOL_RESULT"
  | "STATE"
  | "BUDGET";
export interface ContextItem {
  id: string;
  kind: ContextKind;
  content: Copy;
  source: string;
  timestamp: number;
  reason: Copy;
  trust: "policy" | "user" | "source" | "untrusted" | "derived";
  toolCall?: string;
  units: number;
  priority: number;
  included: boolean;
  exclusion?: Copy;
}
export interface ContextSnapshot {
  at: number;
  capacity: number;
  used: number;
  items: ContextItem[];
}
export interface MemoryItem {
  id: string;
  content: Copy;
  purpose: string;
}
export type ToolId =
  | "search_documents"
  | "read_document"
  | "calculator"
  | "draft_report"
  | "write_report"
  | "send_notification";
export interface ToolDefinition {
  id: ToolId;
  description: Copy;
  inputSchema: Record<string, string>;
  outputSchema: Record<string, string>;
  permission: PermissionName;
  resource: string;
  risk: Copy;
  sandbox: "isolated" | "consequential";
  retryable: boolean;
}
export interface ToolCall {
  id: string;
  tool: ToolId;
  input: Record<string, unknown>;
  output?: unknown;
  status: "selected" | "running" | "succeeded" | "failed" | "denied";
  attempt: number;
  selectedAt: number;
  startedAt?: number;
  completedAt?: number;
  reason: Copy;
  verification: "not_checked" | "pass" | "fail";
}
export interface PolicyDecision {
  at: number;
  callId: string;
  action: PermissionName;
  resource: string;
  subject: string;
  decision: "allow" | "deny";
  reason: Copy;
  credential: string;
  approvalId?: string;
}
export type CheckStatus = "pass" | "fail" | "not_checked" | "warning";
export interface VerificationCheck {
  id: string;
  label: Copy;
  status: CheckStatus;
  detail: Copy;
  evidence: string[];
}
export interface Evidence {
  id: string;
  documentId: string;
  quarter: string;
  value: number;
  revision: string;
  callId: string;
  at: number;
}
export interface ApprovalRequest {
  id: string;
  runId: string;
  action: "report:write";
  resource: string;
  draft: string;
  reason: Copy;
  risk: Copy;
  evidence: string[];
  requestedAt: number;
  expiresAt: number;
  decision: "pending" | "approveOnce" | "deny";
  consumed: boolean;
}
export interface ExecutionBudget {
  used: number;
  limit: number;
  modelCalls: number;
  toolCalls: number;
  retries: number;
  maxRetries: number;
  elapsedMs: number;
  timeLimitMs: number;
}
export interface TraceEvent {
  id: string;
  runId: string;
  seq: number;
  at: number;
  durationMs: number;
  type: string;
  zone: Zone;
  title: Copy;
  detail: Copy;
  parentId?: string;
  data?: unknown;
}
export interface ModelCall {
  id: string;
  context: ContextSnapshot;
  startedAt: number;
  completedAt?: number;
  decision: Copy;
  adapter: "deterministic-script";
}
export interface PlanStep {
  id: string;
  kind:
    | "intent"
    | "policy"
    | "context"
    | "model"
    | "tool"
    | "verify"
    | "evaluate"
    | "audit";
  tool?: ToolId;
  resource?: string;
  reason: Copy;
}
export interface AgentRun {
  id: string;
  scenarioId: string;
  task: Copy;
  status:
    | "ready"
    | "running"
    | "awaiting_approval"
    | "needs_review"
    | "failed"
    | "denied"
    | "complete";
  currentStep: number;
  phase: number;
  zone: Zone;
  policy: { requireApproval: true; includeMemory: boolean };
  identity: AgentIdentity;
  delegatedAuthority: Delegation;
  context: ContextSnapshot;
  memory: MemoryItem[];
  state: {
    candidates: string[];
    selected: string[];
    values: { quarter: string; value: number; evidenceId: string }[];
    growth?: number;
    draft: string;
    report: string;
    writeCount: number;
    outbox: string[];
  };
  modelCalls: ModelCall[];
  toolCalls: ToolCall[];
  verification: VerificationCheck[];
  evaluations: VerificationCheck[];
  approvals: ApprovalRequest[];
  decisions: PolicyDecision[];
  events: TraceEvent[];
  evidence: Evidence[];
  budget: ExecutionBudget;
  startedAt: number;
  completedAt?: number;
  pendingRetry: boolean;
}
export interface ScenarioDefinition {
  id: string;
  title: Copy;
  description: Copy;
  lesson: Copy;
  fault: Fault;
  documents: Document[];
  budget: number;
  contextCapacity: number;
  maxRetries: number;
}
