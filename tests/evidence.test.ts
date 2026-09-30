import { expect, it } from "vitest";
import { scenarios } from "../src/core/scenarios";
import { chapters } from "../src/lessons/content";
import { chapterCoverage, coverageCopy } from "../src/lessons/coverage";
import {
  boundaryDetail,
  boundaryStatement,
  evidenceSources,
  reviewCopy,
  reviewSurface,
  sourceListCopy,
} from "../src/lessons/evidence";

const locales = ["en", "tr"] as const;
// Every user-visible string in these modules is a Copy, so both locales must be
// present and non-empty. A missing Turkish string is a defect, not a fallback.
const bilingual = (value: unknown) => {
  for (const locale of locales)
    expect(typeof (value as Record<string, unknown>)[locale], locale).toBe("string");
  for (const locale of locales)
    expect((value as Record<string, string>)[locale].trim(), locale).not.toBe("");
  expect((value as Record<string, string>).en).not.toBe(
    (value as Record<string, string>).tr,
  );
};

it("maps every guide chapter to scenarios that exist", () => {
  expect(chapterCoverage).toHaveLength(chapters.length);
  const ids = new Set(scenarios.map((s) => s.id));
  const mapped = chapterCoverage.flatMap((c) => c.scenarioIds);
  // A chapter without a scenario leaves the guide unconnectable.
  chapterCoverage.forEach((entry) => {
    expect(entry.scenarioIds.length, `chapter ${entry.chapter}`).toBeGreaterThan(0);
    entry.scenarioIds.forEach((id) => expect(ids.has(id), id).toBe(true));
    bilingual(entry.lookFor);
  });
  // No invented scenario, and no scenario left undemonstrated. A scenario may
  // serve several chapters; it may not be unconnected to the guide entirely.
  expect(new Set(mapped)).toEqual(ids);
  expect(chapterCoverage.map((c) => c.chapter)).toEqual(
    chapters.map((_, i) => i),
  );
});

it("keeps the coverage copy bilingual", () => {
  Object.values(coverageCopy).forEach(bilingual);
});

it("cites only reachable primary sources and states their limits", () => {
  expect(evidenceSources.length).toBeGreaterThanOrEqual(1);
  for (const source of evidenceSources) {
    expect(source.url, source.id).toMatch(/^https:\/\//);
    expect(source.url, source.id).not.toMatch(/aserdargun|w3\.org/);
    bilingual(source.claim);
    bilingual(source.supports);
    // A citation without a stated limit would imply certification.
    bilingual(source.doesNotSupport);
  }
  expect(new Set(evidenceSources.map((s) => s.id)).size).toBe(
    evidenceSources.length,
  );
  expect(new Set(evidenceSources.map((s) => s.url)).size).toBe(
    evidenceSources.length,
  );
});

it("dates the review surface from evidence the repository can show", () => {
  // Only two dates are allowed, and both are traceable: the link check was run
  // against these URLs, the runtime record is dated in docs/QA.md.
  expect(reviewSurface.linkCheckDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  expect(reviewSurface.runtimeRecordDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  expect(reviewSurface.notVerified.length).toBeGreaterThanOrEqual(3);
  reviewSurface.notVerified.forEach(bilingual);
  bilingual(reviewSurface.scope);
  Object.values(reviewCopy).forEach(bilingual);
  sourceListCopy.unsupported.forEach(bilingual);
  bilingual(sourceListCopy.lead);
});

it("states the simulation boundary in both locales", () => {
  bilingual(boundaryStatement);
  bilingual(boundaryDetail);
  expect(boundaryStatement.en).not.toMatch(/certif|guarantee/i);
  expect(boundaryStatement.tr).not.toMatch(/onayl|garanti/i);
});
