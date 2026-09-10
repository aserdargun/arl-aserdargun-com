import { LabControlButton } from "@aserdargun/lab-ui";
import { manifest } from "../ils/catalog";
import { useState } from "react";
import {
  Play,
  Pause,
  StepForward,
  RotateCcw,
  SkipBack,
  ListTree,
  Download,
  ChevronLast,
} from "lucide-react";
import type { Playback } from "../core/playback";
import type { Locale } from "../core/types";
export default function Timeline({
  playback,
  lang,
  playing,
  onPlay,
  onStep,
  onSeek,
  onReset,
  onExport,
}: {
  playback: Playback;
  lang: Locale;
  playing: boolean;
  onPlay: () => void;
  onStep: () => void;
  onSeek: (index: number) => void;
  onReset: () => void;
  onExport: () => void;
}) {
  const [trace, setTrace] = useState(false),
    [filter, setFilter] = useState("all");
  const t = (en: string, tr: string) => (lang === "en" ? en : tr);
  const { history, cursor } = playback,
    run = history[cursor],
    last = history.length - 1,
    ev = run.events.at(-1);
  const stopped =
    [
      "awaiting_approval",
      "needs_review",
      "failed",
      "denied",
      "complete",
    ].includes(run.status) && cursor === last;
  return (
    <section
      className="timeline"
      aria-label={t("Execution timeline", "Yürütme zaman çizgisi")}
    >
      <div className="transport">
        <div className="button-row">
          <LabControlButton
            action={playing ? "pause" : "play"}
            capabilities={manifest.capabilities}
            locale={lang}
            className="primary"
            onClick={onPlay}
            disabled={stopped}
            aria-label={playing ? t("Pause", "Duraklat") : t("Play", "Oynat")}
          >
            {playing ? <Pause size={16} /> : <Play size={16} />}
            <span>{playing ? t("Pause", "Duraklat") : t("Play", "Oynat")}</span>
          </LabControlButton>
          <LabControlButton
            action="step"
            capabilities={manifest.capabilities}
            locale={lang}
            onClick={onStep}
            disabled={stopped}
            aria-label={t("Step / next event", "Adım / sonraki olay")}
          >
            <StepForward size={17} />
            <span>{t("Step", "Adım")}</span>
          </LabControlButton>
          <LabControlButton
            action="rewind"
            capabilities={manifest.capabilities}
            locale={lang}
            onClick={() => onSeek(Math.max(0, cursor - 1))}
            disabled={cursor === 0}
            aria-label={t("Rewind one event", "Bir olay geri sar")}
          >
            <SkipBack size={17} />
            <span>{t("Rewind", "Geri sar")}</span>
          </LabControlButton>
          <LabControlButton
            action="reset"
            capabilities={manifest.capabilities}
            locale={lang}
            onClick={onReset}
            aria-label={t("Reset scenario", "Senaryoyu sıfırla")}
          >
            <RotateCcw size={16} />
            <span>{t("Reset", "Sıfırla")}</span>
          </LabControlButton>
        </div>
        <div className="timeline-slider">
          <label htmlFor="event-cursor">
            {t("Event", "Olay")}{" "}
            <b>
              {cursor} / {last}
            </b>
            <span>{ev?.type ?? "READY"}</span>
          </label>
          <input
            id="event-cursor"
            aria-label={t("Event position", "Olay konumu")}
            type="range"
            min={0}
            max={Math.max(last, 1)}
            value={cursor}
            disabled={!last}
            onChange={(e) => onSeek(Number(e.target.value))}
          />
        </div>
        <button
          className="icon-button"
          onClick={() => onSeek(last)}
          disabled={cursor === last}
          aria-label={t("Return to latest event", "Son olaya dön")}
        >
          <ChevronLast size={19} />
        </button>
        <button
          className={`icon-button ${trace ? "selected" : ""}`}
          onClick={() => setTrace(!trace)}
          aria-label={t("Toggle detailed trace", "Ayrıntılı izi aç/kapat")}
          aria-expanded={trace}
        >
          <ListTree size={20} />
        </button>
        <button
          className="icon-button"
          onClick={onExport}
          aria-label={t("Export trace JSON", "İz JSON dışa aktar")}
        >
          <Download size={18} />
        </button>
      </div>
      <div className="event-caption">
        <span className="event-type">{ev?.type ?? "RUN_READY"}</span>
        <p>
          {ev?.title[lang] ??
            t(
              "Press Play or Step to start a real simulator execution.",
              "Gerçek simülatör yürütmesini başlatmak için Oynat veya Adım kullan.",
            )}
        </p>
        {cursor < last && (
          <strong>{t("Historical view", "Geçmiş görünüm")}</strong>
        )}
      </div>
      {trace && (
        <div className="trace-panel">
          <div className="trace-heading">
            <h3>
              {t(
                "Observability · what happened",
                "Gözlemlenebilirlik · ne oldu",
              )}
            </h3>
            <label>
              {t("Filter", "Filtre")}{" "}
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">{t("All events", "Tüm olaylar")}</option>
                <option value="AUTHORIZATION">
                  {t("Authorization", "Yetkilendirme")}
                </option>
                <option value="TOOL">{t("Tools", "Araçlar")}</option>
                <option value="VERIFICATION">
                  {t("Verification", "Doğrulama")}
                </option>
                <option value="EVALUATION">
                  {t("Evaluation", "Değerlendirme")}
                </option>
                <option value="APPROVAL">{t("Approval", "Onay")}</option>
              </select>
            </label>
          </div>
          <div className="trace-layout">
            <ol className="trace-list">
              {!history
                .at(-1)!
                .events.some(
                  (e) => filter === "all" || e.type.includes(filter),
                ) && (
                <li className="empty">
                  {t(
                    "No recorded events match this filter yet.",
                    "Henüz bu filtreyle eşleşen kayıtlı olay yok.",
                  )}
                </li>
              )}
              {history
                .at(-1)!
                .events.filter(
                  (e) => filter === "all" || e.type.includes(filter),
                )
                .map((e) => (
                  <li key={e.id}>
                    <button
                      className={e.seq === cursor ? "selected" : ""}
                      onClick={() => onSeek(e.seq)}
                      aria-current={e.seq === cursor ? "step" : undefined}
                    >
                      <code>
                        {String(e.seq).padStart(2, "0")} ·{" "}
                        {(e.at / 1000).toFixed(1)}s
                      </code>
                      <span>{e.title[lang]}</span>
                      <small>
                        {e.parentId ?? "run"} / {e.type}
                      </small>
                    </button>
                  </li>
                ))}
            </ol>
            <div className="event-detail">
              <h4>{t("Selected event", "Seçili olay")}</h4>
              <p>{ev?.detail[lang] ?? "—"}</p>
              <dl>
                <dt>{t("Parent span", "Üst aralık")}</dt>
                <dd>{ev?.parentId ?? run.id}</dd>
                <dt>{t("Synthetic duration", "Sentetik süre")}</dt>
                <dd>{ev?.durationMs ?? 0} ms</dd>
                <dt>{t("Timestamp", "Zaman damgası")}</dt>
                <dd>{ev?.at ?? 0} ms</dd>
              </dl>
              <pre>{JSON.stringify(ev?.data ?? {}, null, 2)}</pre>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
