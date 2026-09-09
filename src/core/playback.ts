import { advance, createRun, decideApproval } from "./runtime";
import type { AgentRun } from "./types";
export interface Playback {
  history: AgentRun[];
  cursor: number;
}
export const newPlayback = (scenario = "revenue"): Playback => ({
  history: [createRun(scenario)],
  cursor: 0,
});
export function stepPlayback(p: Playback): Playback {
  if (p.cursor < p.history.length - 1) return { ...p, cursor: p.cursor + 1 };
  const current = p.history[p.cursor],
    next = advance(current);
  return next === current
    ? p
    : { history: [...p.history, next], cursor: p.cursor + 1 };
}
export function approvePlayback(
  p: Playback,
  decision: "approveOnce" | "deny",
): Playback {
  if (p.cursor !== p.history.length - 1) return p;
  const next = decideApproval(p.history[p.cursor], decision);
  return next === p.history[p.cursor]
    ? p
    : { history: [...p.history, next], cursor: p.cursor + 1 };
}
export function exportTrace(p: Playback) {
  return {
    format: "arl-trace",
    version: 1,
    mode: "educational-simulation",
    clock: "synthetic-ms",
    run: p.history.at(-1),
    snapshots: p.history,
    viewedEvent: p.cursor,
  };
}
