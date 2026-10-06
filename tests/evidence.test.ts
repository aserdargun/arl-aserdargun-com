import { expect, it } from "vitest";
import { scenarios, documents, task, tools } from "../src/core/scenarios";
import {
  chapters,
  checkNames,
  lenses,
  statuses,
  zoneNames,
} from "../src/lessons/content";
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
// Terms with no Turkish spelling. `Model` is the runtime zone label rendered by
// RuntimeView, RuntimeWorld and Inspector, and the same word is correct in both
// locales. It is still checked for presence and non-emptiness, and the assertion
// below fails if it ever disappears, so the exemption cannot outlive its term.
const sameInBothLocales = new Set(["Model"]);
// Every user-visible string in these modules is a Copy, so both locales must be
// present and non-empty. A missing Turkish string is a defect, not a fallback.
// The assertion body takes the label separately. `bilingual` keeps a single
// parameter so it can be passed straight to forEach, where a second positional
// parameter would receive the array index and be used as the failure label.
const assertBilingual = (value: unknown, label: string) => {
  for (const locale of locales)
    expect(typeof (value as Record<string, unknown>)[locale], `${label} ${locale}`).toBe(
      "string",
    );
  for (const locale of locales)
    expect(
      (value as Record<string, string>)[locale].trim(),
      `${label} ${locale}`,
    ).not.toBe("");
  const en = (value as Record<string, string>).en.trim();
  if (!sameInBothLocales.has(en))
    expect(en, `${label} shipped as its own translation`).not.toBe(
      (value as Record<string, string>).tr.trim(),
    );
};

const bilingual = (value: unknown) => assertBilingual(value, "copy");

// The guide copy below is checked directly. The runtime surfaces are walked
// instead of enumerated, because a scenario, lens, zone, status or check is
// added to the app by adding an entry to these collections; a hand-maintained
// list of them would fall behind silently.
const isCopy = (value: unknown): value is Record<(typeof locales)[number], string> =>
  value !== null &&
  typeof value === "object" &&
  locales.every((locale) => typeof (value as Record<string, unknown>)[locale] === "string");

function collectCopies(value: unknown, path = "$", found: [string, Record<string, string>][] = []) {
  if (isCopy(value)) found.push([path, value]);
  else if (Array.isArray(value))
    value.forEach((item, index) => collectCopies(item, `${path}[${index}]`, found));
  else if (value && typeof value === "object")
    for (const [key, child] of Object.entries(value))
      collectCopies(child, `${path}.${key}`, found);
  return found;
}

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

it("keeps every rendered runtime string bilingual", () => {
  // The scenario, lens, zone, status, check, tool and document surfaces are what
  // the run actually renders: App renders scenario.description and scenario.lesson,
  // Inspector and RuntimeView render zoneNames and statuses. The guide assertions
  // above never reach them, so a missing Turkish string on a scenario title or a
  // zone label would render as undefined on the Turkish page with every other
  // test still green.
  const surfaces: [string, unknown][] = [
    ["scenarios", scenarios],
    ["documents", documents],
    ["task", task],
    ["tools", tools],
    ["lenses", lenses],
    ["zoneNames", zoneNames],
    ["statuses", statuses],
    ["checkNames", checkNames],
    ["chapters", chapters],
  ];
  const found = surfaces.flatMap(([name, value]) => collectCopies(value, `$.${name}`));

  // A walker that silently stops reaching content would pass by finding nothing.
  // These are the counts measured when the guard was written; they are floors, so
  // adding a scenario or lens cannot quietly drop a surface back out of the walk.
  expect(Object.fromEntries(surfaces.map(([name]) => [name, found.filter(([path]) => path.startsWith(`$.${name}`)).length]))).toMatchObject({
    scenarios: 72,
    documents: 5,
    task: 1,
    tools: 12,
    lenses: 12,
    zoneNames: 11,
    statuses: 7,
    checkNames: 4,
    chapters: 36,
  });
  expect(found.length).toBeGreaterThanOrEqual(160);

  for (const [path, value] of found) assertBilingual(value, path);

  // A listed term is only exempt while it is genuinely present in this surface;
  // a renamed or removed term must not leave a stale exemption behind.
  for (const term of sameInBothLocales) {
    expect(
      found.some(([, value]) => value.en.trim() === term),
      `${term} is exempted but no longer present`,
    ).toBe(true);
  }
});

it("does not ship an English sentence as its own Turkish copy", () => {
  // SameInBothLocales covers codes and the zone label only. A full sentence in
  // both locales is an untranslated string, whatever its length.
  const surfaces: [string, unknown][] = [
    ["scenarios", scenarios],
    ["documents", documents],
    ["task", task],
    ["tools", tools],
    ["lenses", lenses],
    ["zoneNames", zoneNames],
    ["statuses", statuses],
    ["checkNames", checkNames],
    ["chapters", chapters],
    ["coverageCopy", coverageCopy],
  ];
  const duplicated = surfaces
    .flatMap(([name, value]) => collectCopies(value, `$.${name}`))
    .filter(
      ([, value]) =>
        value.en.trim() === value.tr.trim() &&
        !sameInBothLocales.has(value.en.trim()) &&
        value.en.trim().length > 0,
    )
    .map(([path, value]) => `${path}: ${value.en.trim()}`);
  expect(duplicated).toEqual([]);
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
