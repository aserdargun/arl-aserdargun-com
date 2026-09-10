import { describe, it, expect } from "vitest";
import { validateSemanticLearningContext } from "@aserdargun/lab-core";
import { learningGraph } from "../src/ils/graph";
import { modelServingContext, modelServingLink } from "../src/ils/handoff";
import { newPlayback, stepPlayback } from "../src/core/playback";
describe("ARL educational projection", () => {
  it("offers a serving link only after a model invocation and carries no content or authority", () => {
    let p = newPlayback("revenue");
    expect(modelServingContext(p.history[p.cursor])).toBeNull();
    for (let i = 0; i < 30 && !p.history[p.cursor].modelCalls.length; i++)
      p = stepPlayback(p);
    const run = p.history[p.cursor],
      c = modelServingContext(run)!;
    expect(c).not.toBeNull();
    expect(validateSemanticLearningContext(c, learningGraph).ok).toBe(true);
    expect(Object.keys(c.payload).sort()).toEqual([
      "contextClass",
      "priorityClass",
      "requestClass",
    ]);
    expect(JSON.stringify(c)).not.toContain(run.delegatedAuthority.credential);
    expect(new URL(modelServingLink(run, "tr")!).searchParams.get("lang")).toBe(
      "tr",
    );
  });
});
