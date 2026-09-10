import {
  buildLearningLink,
  type Locale,
  type SemanticContext,
} from "@aserdargun/lab-core";
import type { AgentRun } from "../core/types";
import { learningGraph } from "./graph";
export function modelServingContext(
  run: AgentRun,
): SemanticContext<"agent-request"> | null {
  const call = run.modelCalls.at(-1);
  if (!call) return null;
  // ARL units are synthetic, not tokens. Only classify educational context pressure.
  return {
    version: "0.1",
    id: "arl-serving",
    sourceLab: "arl",
    sourceExperiment: run.scenarioId,
    sourceConcept: "concept:agent-runtime",
    targetLab: "tfl",
    targetConcept: "concept:prefill",
    intent: "dive-deeper",
    profile: "agent-request",
    payload: {
      requestClass: "model-invocation",
      contextClass:
        call.context.used / call.context.capacity >= 0.75 ? "long" : "short",
      priorityClass: "normal",
    },
    returnTo: {
      appId: "arl",
      experimentId: run.scenarioId,
      conceptId: "concept:agent-runtime",
    },
  };
}
export function modelServingLink(run: AgentRun, locale: Locale) {
  const context = modelServingContext(run);
  return context
    ? buildLearningLink(learningGraph, {
        targetApp: "tfl",
        experimentId: "single",
        concept: "concept:prefill",
        locale,
        context,
      })
    : null;
}
