import { LabShell } from "@aserdargun/lab-ui";
import "@aserdargun/lab-ui/styles.css";
import { manifest, experiments, initialRoute } from "./ils/catalog";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  BookOpen,
  Boxes,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Layers,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import {
  approvePlayback,
  exportTrace,
  newPlayback,
  stepPlayback,
} from "./core/playback";
import { getScenario, scenarios } from "./core/scenarios";
import { chapters, lenses, statuses } from "./lessons/content";
import type { Lens, Locale } from "./core/types";
import Inspector, { CheckList } from "./components/Inspector";
import Timeline from "./components/Timeline";
import Dialog from "./components/Dialog";
import RuntimeView from "./components/RuntimeView";
const lensIcons = { hns: Boxes, ctx: Layers, sec: ShieldCheck, evl: Activity };
const route = initialRoute(window.location.search);
export default function App() {
  const [lang, setLang] = useState<Locale>(() => {
    if (route.locale) return route.locale;
    try {
      return localStorage.getItem("arl.locale") === "tr" ? "tr" : "en";
    } catch {
      return "en";
    }
  });
  const [playback, setPlayback] = useState(() => newPlayback(route.scenario));
  const [lens, setLens] = useState<Lens>("hns"),
    [playing, setPlaying] = useState(false),
    [modal, setModal] = useState<
      "review" | "learn" | "resources" | "inspect" | "export" | null
    >(route.lesson ? "learn" : null),
    [chapter, setChapter] = useState(0),
    [speed, setSpeed] = useState(350);
  const run = playback.history[playback.cursor],
    scenario = getScenario(run.scenarioId),
    isLive = playback.cursor === playback.history.length - 1,
    t = (en: string, tr: string) => (lang === "en" ? en : tr);
  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      localStorage.setItem("arl.locale", lang);
    } catch {}
  }, [lang]);
  useEffect(() => {
    if (!playing || modal !== null) return;
    const id = window.setInterval(
      () => setPlayback((p) => stepPlayback(p)),
      speed,
    );
    return () => clearInterval(id);
  }, [playing, speed, modal]);
  useEffect(() => {
    if (modal !== null) setPlaying(false);
  }, [modal]);
  useEffect(() => {
    if (
      isLive &&
      [
        "awaiting_approval",
        "needs_review",
        "failed",
        "denied",
        "complete",
      ].includes(run.status)
    )
      setPlaying(false);
  }, [run.status, isLive]);
  useEffect(() => {
    if (isLive && run.events.at(-1)?.type === "APPROVAL_REQUESTED")
      setLens("sec");
    if (isLive && run.events.at(-1)?.type === "EVALUATION_FAILED")
      setLens("evl");
  }, [playback.cursor, isLive, run.events]);
  const chapterEvent = playback.history.findIndex(
    (r) => r.events.at(-1)?.zone === chapters[chapter].zone,
  );
  const traceJSON = useMemo(
    () =>
      modal === "export" ? JSON.stringify(exportTrace(playback), null, 2) : "",
    [modal, playback],
  );
  function seek(index: number) {
    setPlaying(false);
    setPlayback((p) => ({
      ...p,
      cursor: Math.max(0, Math.min(index, p.history.length - 1)),
    }));
  }
  function reset(id = run.scenarioId) {
    setPlaying(false);
    setPlayback(newPlayback(id));
    setModal(null);
  }
  function decide(decision: "approveOnce" | "deny") {
    setPlayback((p) => approvePlayback(p, decision));
    setModal(null);
    if (decision === "approveOnce") setPlaying(true);
  }
  function exportRun() {
    const blob = new Blob([traceJSON], {
        type: "application/json",
      }),
      url = URL.createObjectURL(blob),
      a = document.createElement("a");
    a.href = url;
    a.download = `${run.id}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const changeLens = (id: Lens) => {
    setLens(id);
    if (window.matchMedia("(max-width:850px)").matches) setModal("inspect");
  };
  return (
    <>
      <a className="skip-link" href="#workstation">
        {t("Skip to laboratory", "Laboratuvara atla")}
      </a>
      <header className="site-header">
        <a
          href="#"
          className="brand"
          aria-label="ARL — Agent Runtime Laboratory"
        >
          <span className="brand-mark">ARL</span>
          <span>Agent Runtime Laboratory</span>
        </a>
        <nav aria-label={t("Primary navigation", "Ana gezinme")}>
          <a className="nav-active" href="#workstation">
            {t("Run", "Çalıştır")}
          </a>
          <button onClick={() => setModal("learn")}>
            <BookOpen size={16} />
            {t("Learn", "Öğren")}
          </button>
          <button
            className="language"
            aria-label={t("Switch to Turkish", "İngilizceye geç")}
            onClick={() => setLang(lang === "en" ? "tr" : "en")}
          >
            <b>{lang.toUpperCase()}</b>
            <span>/ {lang === "en" ? "TR" : "EN"}</span>
          </button>
          <a
            className="ecosystem"
            href="https://aserdargun.com"
            target="_blank"
            rel="noreferrer"
          >
            aserdargun.com
            <ArrowUpRight size={14} />
          </a>
        </nav>
      </header>
      <main>
        <section className="intro">
          <h1>
            {t(
              "See what happens between intent and action.",
              "Niyet ile eylem arasında neler olduğunu görün.",
            )}
          </h1>
          <div>
            <p className="intro-lead">
              {t(
                "One execution. Four engineering perspectives.",
                "Tek yürütme. Dört mühendislik perspektifi.",
              )}
            </p>
            <p className="intro-note">
              {t(
                "Educational simulation · No live model or external actions",
                "Eğitsel simülasyon · Canlı model veya dış eylem yok",
              )}
            </p>
          </div>
        </section>
        <section
          className="scenario-bar"
          aria-label={t("Scenario selection", "Senaryo seçimi")}
        >
          <span className="scenario-number">
            {String(scenarios.indexOf(scenario) + 1).padStart(2, "0")}
          </span>
          <label htmlFor="scenario">{t("Scenario", "Senaryo")}</label>
          <select
            id="scenario"
            value={scenario.id}
            onChange={(e) => reset(e.target.value)}
          >
            {scenarios.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title[lang]}
              </option>
            ))}
          </select>
          <p>{scenario.description[lang]}</p>
          <button onClick={() => setModal("resources")}>
            <FileText size={16} />
            {t("Documents", "Belgeler")}
          </button>
        </section>
        <section
          id="workstation"
          className="workstation"
          aria-label={t(
            "Agent runtime laboratory",
            "Ajan çalışma laboratuvarı",
          )}
        >
          <div
            className="lens-bar"
            role="tablist"
            aria-label={t("Engineering lens", "Mühendislik merceği")}
            onKeyDown={(e) => {
              if (["ArrowRight", "ArrowLeft", "Home", "End"].includes(e.key)) {
                e.preventDefault();
                const ids = Object.keys(lenses) as Lens[],
                  i = ids.indexOf(lens),
                  n =
                    e.key === "Home"
                      ? 0
                      : e.key === "End"
                        ? 3
                        : (i + (e.key === "ArrowRight" ? 1 : 3)) % 4;
                setLens(ids[n]);
                document.getElementById(`lens-${ids[n]}`)?.focus();
              }
            }}
          >
            {(Object.keys(lenses) as Lens[]).map((id) => {
              const Icon = lensIcons[id];
              return (
                <button
                  id={`lens-${id}`}
                  role="tab"
                  aria-controls="runtime-panel"
                  aria-selected={lens === id}
                  tabIndex={lens === id ? 0 : -1}
                  key={id}
                  onClick={() => changeLens(id)}
                >
                  <Icon size={18} />
                  <strong>{id.toUpperCase()}</strong>
                  <span>{lenses[id].name[lang]}</span>
                </button>
              );
            })}
          </div>
          <div
            id="runtime-panel"
            className="runtime-grid"
            role="tabpanel"
            aria-labelledby={`lens-${lens}`}
          >
            <div className="world-panel">
              <div className={`run-heading status-${run.status}`}>
                <span className="status-dot" />
                <div>
                  <strong
                    data-testid="run-status"
                    role="status"
                    aria-live="polite"
                  >
                    {statuses[run.status][lang]}
                  </strong>
                  <span>
                    {isLive
                      ? t("Latest state", "Son durum")
                      : t("Historical snapshot", "Geçmiş anlık görüntü")}{" "}
                    · {run.id}
                  </span>
                </div>
                {run.status === "ready" && (
                  <button
                    className="primary start-run"
                    onClick={() => setPlaying(true)}
                  >
                    {t("Start run", "Başlat")}
                  </button>
                )}
                <label className="speed-select">
                  {t("Pace", "Hız")}
                  <select
                    aria-label={t("Playback pace", "Oynatma hızı")}
                    value={speed}
                    onChange={(e) => setSpeed(Number(e.target.value))}
                  >
                    <option value={700}>{t("Slow", "Yavaş")}</option>
                    <option value={350}>{t("Normal", "Normal")}</option>
                    <option value={70}>{t("Fast", "Hızlı")}</option>
                  </select>
                </label>
              </div>
              <RuntimeView run={run} lens={lens} lang={lang} />
              <div className="world-message">
                <span>
                  {run.events.at(-1)?.seq
                    ? String(run.events.at(-1)!.seq).padStart(2, "0")
                    : "00"}
                </span>
                <div>
                  <strong>
                    {run.events.at(-1)?.title[lang] ??
                      t(
                        "Prepare the quarterly revenue update.",
                        "Çeyrek gelir güncellemesini hazırla.",
                      )}
                  </strong>
                  <p>{run.events.at(-1)?.detail[lang] ?? run.task[lang]}</p>
                </div>
              </div>
              {[
                "awaiting_approval",
                "needs_review",
                "failed",
                "denied",
                "complete",
              ].includes(run.status) && (
                <div className={`run-outcome outcome-${run.status}`}>
                  <p>
                    {!isLive
                      ? t(
                          "You are inspecting history. Return to the latest event to act.",
                          "Geçmişi inceliyorsunuz. Eylem için son olaya dönün.",
                        )
                      : run.status === "awaiting_approval"
                        ? t(
                            "The report is unchanged. Review the draft to approve or deny this write.",
                            "Rapor değişmedi. Yazmayı onaylamak veya reddetmek için taslağı inceleyin.",
                          )
                        : run.status === "complete"
                          ? t(
                              "One approved write. Replay the trace or inspect the final report.",
                              "Onaylı tek yazma. İzi yeniden oynatın veya son raporu inceleyin.",
                            )
                          : run.status === "needs_review"
                            ? t(
                                "Evidence checks failed. The report is unchanged; inspect EVL for the cause.",
                                "Kanıt denetimleri başarısız. Rapor değişmedi; nedeni EVL içinde inceleyin.",
                              )
                            : t(
                                "The run stopped without writing. Inspect the last event or reset to try again.",
                                "Yürütme yazmadan durdu. Son olayı inceleyin veya tekrar denemek için sıfırlayın.",
                              )}
                  </p>
                  <button
                    onClick={() => {
                      if (!isLive) seek(playback.history.length - 1);
                      else if (run.status === "awaiting_approval")
                        setModal("review");
                      else if (run.status === "complete") setModal("resources");
                      else {
                        setLens(run.status === "needs_review" ? "evl" : "hns");
                        setModal("inspect");
                      }
                    }}
                  >
                    {!isLive
                      ? t("Return to latest", "Son olaya dön")
                      : run.status === "awaiting_approval"
                        ? t("Review action", "Eylemi incele")
                        : run.status === "complete"
                          ? t("View report", "Raporu gör")
                          : t("Inspect result", "Sonucu incele")}
                  </button>
                </div>
              )}
            </div>
            <button
              className="inspect-mobile"
              onClick={() => setModal("inspect")}
            >
              <Layers size={18} />
              {t("Inspect current event", "Mevcut olayı incele")}
              <strong>{lens.toUpperCase()}</strong>
              <ChevronRight size={17} />
            </button>
            <div className="desktop-inspector">
              <Inspector
                run={run}
                lens={lens}
                lang={lang}
                onReview={() => setModal("review")}
                onDeny={() => decide("deny")}
                isLive={isLive}
              />
            </div>
          </div>
          <Timeline
            playback={playback}
            lang={lang}
            playing={playing}
            onPlay={() => setPlaying((p) => !p)}
            onStep={() => {
              setPlaying(false);
              setPlayback((p) => stepPlayback(p));
            }}
            onSeek={seek}
            onReset={() => reset()}
            onExport={() => {
              setPlaying(false);
              setModal("export");
            }}
          />
        </section>
        <section className="lesson-strip">
          <BookOpen size={22} />
          <p>{scenario.lesson[lang]}</p>
          <button onClick={() => setModal("learn")}>
            {t("Agent Runtime 101", "Ajan Çalışma Sistemi 101")}
            <ChevronRight size={16} />
          </button>
        </section>
        <LabShell
          manifest={manifest}
          experiment={experiments.find((e) => e.id === scenario.id)!}
          locale={lang}
        />
        <footer>
          <span>
            {t(
              "General agent system concepts · Educational abstraction",
              "Genel ajan sistemi kavramları · Eğitsel soyutlama",
            )}
          </span>
          <div>
            {t("Learn the theory", "Teoriyi öğren")}
            {(Object.keys(lenses) as Lens[]).map((id) => (
              <a
                key={id}
                href={lenses[id].url}
                target="_blank"
                rel="noreferrer"
              >
                {id.toUpperCase()}
                <ArrowUpRight size={12} />
              </a>
            ))}
          </div>
        </footer>
      </main>
      <Dialog
        className={modal === "inspect" ? "inspector-sheet" : ""}
        open={modal !== null}
        onClose={() => setModal(null)}
        title={
          modal === "export"
            ? t("Export the run", "Yürütmeyi dışa aktar")
            : modal === "inspect"
              ? lenses[lens].name[lang]
              : modal === "review"
                ? t(
                    "Review the consequential action",
                    "Sonuç doğuran eylemi incele",
                  )
                : modal === "learn"
                  ? t("Agent Runtime 101", "Ajan Çalışma Sistemi 101")
                  : t("Synthetic document store", "Sentetik belge deposu")
        }
        closeLabel={t("Close dialog", "Pencereyi kapat")}
      >
        {modal === "export" && (
          <div className="export-preview">
            <p>
              {t(
                "This JSON contains the synthetic run and its historical snapshots. Download it, or select and copy the text directly.",
                "Bu JSON, sentetik yürütmeyi ve geçmiş anlık görüntülerini içerir. İndirin veya metni seçip doğrudan kopyalayın.",
              )}
            </p>
            <textarea
              aria-label={t("Trace JSON", "İz JSON")}
              readOnly
              value={traceJSON}
              onFocus={(e) => e.currentTarget.select()}
            />
            <button className="primary" onClick={exportRun}>
              {t("Download JSON", "JSON indir")}
            </button>
          </div>
        )}
        {modal === "inspect" && (
          <Inspector
            run={run}
            lens={lens}
            lang={lang}
            onReview={() => setModal("review")}
            onDeny={() => decide("deny")}
            isLive={isLive}
          />
        )}
        {modal === "review" && (
          <div className="review">
            <p className="review-warning">
              {t(
                "You govern this boundary. Approval permits one exact report update in this simulated world.",
                "Bu sınırı siz yönetiyorsunuz. Onay, bu simüle dünyada tam olarak bir rapor güncellemesine izin verir.",
              )}
            </p>
            <dl>
              <dt>{t("Action", "Eylem")}</dt>
              <dd>
                <code>report:write</code>
              </dd>
              <dt>{t("Resource", "Kaynak")}</dt>
              <dd>Executive_Report.md</dd>
              <dt>{t("Risk", "Risk")}</dt>
              <dd>
                {t(
                  "Replace the simulated executive report. No external file is modified.",
                  "Simüle yönetici raporunu değiştirir. Dış dosya değiştirilmez.",
                )}
              </dd>
              <dt>{t("Scope", "Kapsam")}</dt>
              <dd>
                {t(
                  "This run + this draft + this resource. Expires after 30 simulated seconds.",
                  "Bu yürütme + bu taslak + bu kaynak. 30 simüle saniye sonra sona erer.",
                )}
              </dd>
            </dl>
            <h3>{t("Exact draft to commit", "Kaydedilecek tam taslak")}</h3>
            <blockquote>{run.approvals.at(-1)?.draft}</blockquote>
            <h3>
              {t("Evidence and task contract", "Kanıt ve görev sözleşmesi")}
            </h3>
            <CheckList checks={run.evaluations} lang={lang} />
            <p>
              {t(
                "One-use approval never adds broad permanent authority. Human review does not eliminate every risk.",
                "Tek kullanımlık onay geniş ve kalıcı yetki eklemez. İnsan incelemesi her riski ortadan kaldırmaz.",
              )}
            </p>
            <div className="button-row">
              <button
                className="primary"
                disabled={!isLive || run.status !== "awaiting_approval"}
                onClick={() => decide("approveOnce")}
              >
                <CheckCircle2 size={18} />
                {t("Approve once", "Bir kez onayla")}
              </button>
              <button
                disabled={!isLive || run.status !== "awaiting_approval"}
                onClick={() => decide("deny")}
              >
                <XCircle size={18} />
                {t("Deny action", "Eylemi reddet")}
              </button>
            </div>
          </div>
        )}
        {modal === "resources" && (
          <div className="resource-store">
            <p>
              {t(
                "Controlled fixtures, not real company documents. PDF names denote synthetic records; no PDF parser is claimed. Model context contains only items actually retrieved and included.",
                "Kontrollü veriler; gerçek şirket belgeleri değildir. PDF adları sentetik kayıtları gösterir; PDF ayrıştırıcısı iddiası yoktur. Model bağlamı yalnızca getirilen ve dahil edilen öğeleri içerir.",
              )}
            </p>
            {scenario.documents.map((d) => (
              <details key={d.id}>
                <summary>
                  <FileText size={17} />
                  {d.title}
                  <code>{d.trust}</code>
                </summary>
                <p>{d.content[lang]}</p>
                <small>
                  {d.id} · {d.revision}
                </small>
              </details>
            ))}
            <details open>
              <summary>
                Executive_Report.md{" "}
                <code>{t("world resource", "dünya kaynağı")}</code>
              </summary>
              <p>{run.state.report}</p>
              <strong>
                {t("Writes", "Yazma")}: {run.state.writeCount}
              </strong>
            </details>
            <details>
              <summary>external-outbox</summary>
              <p>
                {run.state.outbox.length}{" "}
                {t("messages sent", "ileti gönderildi")}
              </p>
            </details>
          </div>
        )}
        {modal === "learn" && (
          <div className="learn">
            <div
              className="chapter-nav"
              aria-label={t("Lesson chapters", "Ders bölümleri")}
            >
              {chapters.map((c, i) => (
                <button
                  key={i}
                  className={chapter === i ? "selected" : ""}
                  onClick={() => setChapter(i)}
                  aria-label={`${i + 1}. ${c.title[lang]}`}
                  aria-current={chapter === i ? "step" : undefined}
                >
                  {String(i + 1).padStart(2, "0")}
                </button>
              ))}
            </div>
            <span className="chapter-count">
              {t("CHAPTER", "BÖLÜM")} {String(chapter + 1).padStart(2, "0")} /
              12
            </span>
            <h3>{chapters[chapter].title[lang]}</h3>
            <p className="chapter-body">{chapters[chapter].body[lang]}</p>
            <div className="try-it">
              <strong>
                {t("Try it in the laboratory", "Laboratuvarda dene")}
              </strong>
              <p>{chapters[chapter].try[lang]}</p>
              {chapterEvent < 0 && (
                <p className="lesson-unavailable">
                  {t(
                    "This station has no recorded event yet. Continue the run first; writing and audit require your approval.",
                    "Bu istasyon için henüz olay kaydedilmedi. Önce yürütmeyi ilerletin; yazma ve denetim izi onayınızı gerektirir.",
                  )}
                </p>
              )}
              <button
                disabled={chapterEvent < 0}
                onClick={() => {
                  if (chapterEvent < 0) return;
                  seek(chapterEvent);
                  setLens(
                    chapter === 1
                      ? "ctx"
                      : chapter === 4 || chapter === 9
                        ? "sec"
                        : chapter === 7 || chapter === 8
                          ? "evl"
                          : "hns",
                  );
                  setModal(null);
                }}
              >
                {t("Inspect in this run", "Bu yürütmede incele")}
                <ArrowUpRight size={16} />
              </button>
            </div>
            <div className="button-row chapter-controls">
              <button
                disabled={chapter === 0}
                onClick={() => setChapter((c) => c - 1)}
              >
                <ChevronLeft size={16} />
                {t("Previous", "Önceki")}
              </button>
              <button
                disabled={chapter === 11}
                className="primary"
                onClick={() => setChapter((c) => c + 1)}
              >
                {t("Next chapter", "Sonraki bölüm")}
                <ChevronRight size={16} />
              </button>
            </div>
            <details>
              <summary>
                {t(
                  "Where ARL fits in the learning system",
                  "ARL öğrenme sisteminde nerede?",
                )}
              </summary>
              <p>
                HNS / CTX / SEC / EVL → ARL →{" "}
                {t("authorized action", "yetkili eylem")}
              </p>
              <p>
                {t(
                  "A model call can be explored deeper through serving and hardware layers:",
                  "Model çağrısı, sunum ve donanım katmanlarıyla daha derin incelenebilir:",
                )}
              </p>
              <p>
                ARL →{" "}
                <a
                  href="https://tfl.aserdargun.com"
                  target="_blank"
                  rel="noreferrer"
                >
                  TFL
                </a>{" "}
                →{" "}
                <a
                  href="https://gex.aserdargun.com"
                  target="_blank"
                  rel="noreferrer"
                >
                  GEX
                </a>
              </p>
              <p>
                {t(
                  "Intent → agent → token → silicon → action is a conceptual learning path, not a literal single execution sequence. ARL stops at the model-call boundary.",
                  "Niyet → ajan → token → silikon → eylem kavramsal öğrenme yoludur; tek bir gerçek yürütme sırası değildir. ARL model çağrısı sınırında durur.",
                )}
              </p>
            </details>
          </div>
        )}
      </Dialog>
    </>
  );
}
