import { expect, it } from "vitest";
import {
  approvePlayback,
  exportTrace,
  newPlayback,
  stepPlayback,
} from "../src/core/playback";
it("rewind and replay never execute a side effect twice", () => {
  let p = newPlayback();
  for (let i = 0; i < 120; i++) p = stepPlayback(p);
  p = approvePlayback(p, "approveOnce");
  for (let i = 0; i < 20; i++) p = stepPlayback(p);
  const count = p.history.length;
  p = { ...p, cursor: 0 };
  expect(approvePlayback(p, "approveOnce")).toBe(p);
  for (let i = 0; i < count + 10; i++) p = stepPlayback(p);
  expect(p.history).toHaveLength(count);
  expect(p.history.at(-1)?.state.writeCount).toBe(1);
  expect(exportTrace(p).version).toBe(1);
});
