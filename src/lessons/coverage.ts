import { txt, type Copy } from "../core/types";

/**
 * Which of the nine scenarios demonstrates which of the twelve guide chapters.
 *
 * The map is authored for this site. It is not derived from a curriculum, a
 * standard or the cited evidence documents, and it does not claim that a
 * scenario covers a chapter completely. `scenarioId` values are checked against
 * src/core/scenarios.ts in tests/coverage.test.ts.
 */
export interface ChapterCoverage {
  /** Zero-based index into `chapters` in src/lessons/content.ts. */
  chapter: number;
  scenarioIds: string[];
  /** What to watch for in that scenario for this chapter. */
  lookFor: Copy;
}

export const chapterCoverage: ChapterCoverage[] = [
  {
    chapter: 0,
    scenarioIds: ["revenue", "budget"],
    lookFor: txt(
      "The task states the objective and the no-write constraint; the budget scenario shows the same constraint losing to a stopping rule.",
      "Görev amaç ile yazmama kısıtını birlikte verir; bütçe senaryosu aynı kısıtın bir durma kuralına yenildiğini gösterir.",
    ),
  },
  {
    chapter: 1,
    scenarioIds: ["revenue", "overflow"],
    lookFor: txt(
      "Compare the CTX snapshot before and after a read; the overflow scenario shows a retrieved item that is never included.",
      "Bir okuma öncesi ve sonrası CTX anlık görüntüsünü karşılaştırın; taşma senaryosu hiç dahil edilmeyen getirilmiş bir öğeyi gösterir.",
    ),
  },
  {
    chapter: 2,
    scenarioIds: ["revenue", "injection"],
    lookFor: txt(
      "Every model call records the exact context it received. The injection scenario records the untrusted note before the decision that refuses it.",
      "Her model çağrısı aldığı tam bağlamı kaydeder. Enjeksiyon senaryosu, reddeden karar öncesinde güvenilmeyen notu kaydeder.",
    ),
  },
  {
    chapter: 3,
    scenarioIds: ["revenue", "retry"],
    lookFor: txt(
      "Follow the tool router decision to the calculator call, then watch a first attempt fail without any write being attempted.",
      "Araç yönlendirici kararından hesaplayıcı çağrısına ilerleyin; ardından hiçbir yazma denenmeden ilk denemenin başarısız olduğunu izleyin.",
    ),
  },
  {
    chapter: 4,
    scenarioIds: ["revenue", "injection"],
    lookFor: txt(
      "report:write is absent from the delegated permissions; notification:send is refused for the note that requests it.",
      "Devredilen izinlerde report:write yoktur; onu isteyen not için notification:send reddedilir.",
    ),
  },
  {
    chapter: 5,
    scenarioIds: ["injection", "revenue"],
    lookFor: txt(
      "The consequential tools are write_report and send_notification. Both are labeled, not isolated by any real boundary.",
      "Sonuç doğuran araçlar write_report ve send_notification'dur. İkisi de gerçek bir sınırla değil, etiketle ayrılmıştır.",
    ),
  },
  {
    chapter: 6,
    scenarioIds: ["retry", "timeout"],
    lookFor: txt(
      "Two bounded attempts recover; the same budget stops the run after two retries with an explicit failure.",
      "İki sınırlı deneme kurtarır; aynı bütçe iki yeniden denemeden sonra açık bir hatayla yürütmeyi durdurur.",
    ),
  },
  {
    chapter: 7,
    scenarioIds: ["bad-evidence", "calculation"],
    lookFor: txt(
      "A wrong quarter and a wrong percentage each fail a different check, while the independent 25% computation still passes.",
      "Yanlış çeyrek ve yanlış yüzde farklı denetimlerden geçemez; bağımsız %25 hesabı yine de geçer.",
    ),
  },
  {
    chapter: 8,
    scenarioIds: ["bad-evidence", "missing", "calculation"],
    lookFor: txt(
      "The outcome is failed while arithmetic is still passed, and a missing quarter is never promoted into a supported claim.",
      "Aritmetik geçerken sonuç başarısızdır; eksik çeyrek hiçbir zaman desteklenen bir iddiaya yükseltilmez.",
    ),
  },
  {
    chapter: 9,
    scenarioIds: ["revenue", "injection"],
    lookFor: txt(
      "Open the review surface for the exact draft; the injection scenario asks for a second, unauthorized approval that should never be granted.",
      "Tam taslak için inceleme yüzeyini açın; enjeksiyon senaryosu asla verilmemesi gereken ikinci, yetkisiz bir onay ister.",
    ),
  },
  {
    chapter: 10,
    scenarioIds: ["revenue"],
    lookFor: txt(
      "Exactly one write, the grant is consumed, and the base permission list is unchanged afterwards.",
      "Tam olarak bir yazma, izin tüketilir ve sonrasında temel izin listesi değişmez.",
    ),
  },
  {
    chapter: 11,
    scenarioIds: ["revenue", "timeout", "budget"],
    lookFor: txt(
      "Rewind to the authorization event and switch lenses; the recorded side effect is not executed a second time.",
      "Yetkilendirme olayına geri sarın ve mercekleri değiştirin; kaydedilmiş yan etki ikinci kez yürütülmez.",
    ),
  },
];

export const coverageCopy = {
  heading: txt(
    "Which scenario demonstrates this chapter",
    "Bu bölümü hangi senaryo gösteriyor",
  ),
  note: txt(
    "Authored for this site, not taken from a curriculum. A listed scenario shows the boundary; it does not cover the chapter completely.",
    "Bu site için yazıldı, bir müfredattan alınmadı. Listelenen senaryo sınırı gösterir; bölümün tamamını kapsamaz.",
  ),
  demonstratedLabel: txt("Demonstrated by", "Gösteren senaryolar"),
};
