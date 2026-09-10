import {
  txt,
  type AgentRun,
  type ScenarioDefinition,
  type VerificationCheck,
} from "./types";
export function growth(previous: number, latest: number): number | undefined {
  if (!Number.isFinite(previous) || !Number.isFinite(latest) || previous === 0)
    return undefined;
  const percent = ((latest - previous) / previous) * 100;
  return Number.isFinite(percent) ? percent : undefined;
}
export function verify(
  run: AgentRun,
  s: ScenarioDefinition,
): VerificationCheck[] {
  const ev = run.evidence,
    previous = ev.find((e) => e.quarter === "Q2"),
    latest = ev.find((e) => e.quarter === "Q3");
  const check = (
    id: string,
    en: string,
    tr: string,
    ok: boolean,
    detail: ReturnType<typeof txt>,
  ): VerificationCheck => ({
    id,
    label: txt(en, tr),
    status: ok ? "pass" : "fail",
    detail,
    evidence: ev.map((e) => e.id),
  });
  const values = run.state.values,
    pv = values.find((v) => v.quarter === "Q2"),
    lv = values.find((v) => v.quarter === "Q3");
  const expected = pv && lv ? growth(pv.value, lv.value) : undefined;
  return [
    check(
      "latestQuarterFound",
      "Latest quarter is Q3",
      "Son çeyrek Q3",
      !!latest,
      txt(
        "Q3 is the latest available quarter in this fixture. A Q1 draft cannot substitute for it.",
        "Bu veri setinde son çeyrek Q3. Q1 taslağı onun yerine geçemez.",
      ),
    ),
    check(
      "previousQuarterFound",
      "Previous quarter is Q2",
      "Önceki çeyrek Q2",
      !!previous,
      txt(
        "The comparison requires independent Q2 evidence.",
        "Karşılaştırma bağımsız Q2 kanıtı gerektirir.",
      ),
    ),
    check(
      "sourcesValid",
      "Sources exist and revisions match",
      "Kaynaklar mevcut ve sürümler eşleşiyor",
      ev.length === 2 &&
        new Set(ev.map((e) => e.id)).size === 2 &&
        new Set(ev.map((e) => e.documentId)).size === 2 &&
        ev.every((e) =>
          s.documents.some(
            (d) =>
              d.id === e.documentId &&
              d.revision === e.revision &&
              d.trust === "source" &&
              d.quarter === e.quarter &&
              d.revenue === e.value &&
              Number.isFinite(e.value) &&
              run.toolCalls.some(
                (c) =>
                  c.id === e.callId &&
                  c.tool === "read_document" &&
                  c.status === "succeeded" &&
                  c.input.documentId === e.documentId,
              ),
          ),
        ),
      txt(
        "Check the source registry, trust label and exact revision.",
        "Kaynak kaydı, güven etiketi ve tam sürüm denetlenir.",
      ),
    ),
    check(
      "valuesVerified",
      "Extracted values match source records",
      "Çıkarılan değerler kaynakla eşleşiyor",
      values.length === 2 &&
        values.every((v) => {
          const e = ev.find((e) => e.id === v.evidenceId);
          return (
            !!e &&
            e.quarter === v.quarter &&
            e.value === v.value &&
            s.documents.some(
              (d) =>
                d.id === e.documentId &&
                d.quarter === v.quarter &&
                d.revenue === v.value,
            )
          );
        }),
      txt(
        "Both extracted numbers must be supported by source records.",
        "Çıkarılan iki sayı da kaynak kayıtlarıyla desteklenmeli.",
      ),
    ),
    check(
      "calculationVerified",
      "Percentage change is independently correct",
      "Yüzde değişimi bağımsız olarak doğru",
      expected !== undefined &&
        run.state.growth !== undefined &&
        Math.abs(expected - run.state.growth) < 1e-9,
      txt(
        `Claim: ${run.state.growth ?? "unknown"}%. Expected: ${expected ?? "unknown"}%. Formula: (latest − previous) / previous × 100.`,
        `İddia: %${run.state.growth ?? "bilinmiyor"}. Beklenen: %${expected ?? "bilinmiyor"}. Formül: (son − önceki) / önceki × 100.`,
      ),
    ),
    check(
      "statementConsistent",
      "Draft agrees with verified values and cites both sources",
      "Taslak doğrulanmış değerlerle tutarlı ve iki kaynağı alıntılıyor",
      !!previous &&
        !!latest &&
        expected !== undefined &&
        run.state.draft ===
          draftStatement(previous.value, latest.value, expected, [
            previous.id,
            latest.id,
          ]),
      txt(
        "Compare the entire structured statement and source references against independently verified values.",
        "Yapılandırılmış ifadenin tamamını ve kaynak referanslarını bağımsız doğrulanan değerlerle karşılaştır.",
      ),
    ),
  ];
}
export function draftStatement(
  previous: number,
  latest: number,
  percent: number,
  refs: string[],
) {
  return `Q3 revenue: ${latest} million scenario units; Q2: ${previous} million. Change: ${Number(percent.toFixed(2))}%. Sources: [${refs.join("], [")}].`;
}
export function evaluate(run: AgentRun): VerificationCheck[] {
  return [
    ...run.verification.map((c) => ({ ...c })),
    {
      id: "writePolicySatisfied",
      label: txt(
        "Write has explicit human authority",
        "Yazma için açık insan yetkisi var",
      ),
      status: "not_checked",
      detail: txt(
        "Not yet authorized. A verified draft is ready for review, not permission to write.",
        "Henüz yetkilendirilmedi. Doğrulanmış taslak incelemeye hazırdır; yazma izni değildir.",
      ),
      evidence: [],
    },
  ];
}
