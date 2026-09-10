import { Component, Suspense, lazy, useState, type ReactNode } from "react";
import type { AgentRun, Lens, Locale, Zone } from "../core/types";
import { zoneNames } from "../lessons/content";
const RuntimeWorld = lazy(() => import("../visualization/RuntimeWorld"));
const route: Zone[] = [
  "intent",
  "context",
  "model",
  "router",
  "authority",
  "sandbox",
  "verify",
  "evaluate",
  "approval",
  "world",
  "audit",
];
class SceneBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
function TextTopology({ run, lang }: { run: AgentRun; lang: Locale }) {
  return (
    <ol className="text-topology">
      {route.map((z, i) => (
        <li
          className={run.zone === z ? "current" : ""}
          key={z}
          aria-current={run.zone === z ? "step" : undefined}
        >
          <span>{String(i + 1).padStart(2, "0")}</span>
          {zoneNames[z][lang]}
          {run.zone === z && (
            <strong>{lang === "en" ? "Current" : "Şimdi"}</strong>
          )}
        </li>
      ))}
    </ol>
  );
}
export default function RuntimeView(props: {
  run: AgentRun;
  lens: Lens;
  lang: Locale;
}) {
  const [flat, setFlat] = useState(
      () =>
        window.matchMedia("(max-width:850px), (prefers-reduced-motion: reduce)")
          .matches,
    ),
    [camera, setCamera] = useState(0);
  const fallback = <TextTopology run={props.run} lang={props.lang} />;
  return (
    <>
      <div className="world-tools">
        <span>
          {props.lang === "en"
            ? "Runtime topology · educational geometry"
            : "Çalışma topolojisi · eğitsel geometri"}
        </span>
        <div>
          <button onClick={() => setFlat(!flat)}>
            {flat ? "3D" : props.lang === "en" ? "Text view" : "Metin görünümü"}
          </button>
          {!flat && (
            <button
              onClick={() => setCamera((k) => k + 1)}
              aria-label={
                props.lang === "en" ? "Reset camera" : "Kamerayı sıfırla"
              }
            >
              ↺
            </button>
          )}
        </div>
      </div>
      <div
        className="scene"
        role="region"
        aria-label={`${props.lang === "en" ? "Runtime topology. Current station" : "Çalışma topolojisi. Mevcut istasyon"}: ${zoneNames[props.run.zone][props.lang]}. ${props.lang === "en" ? "Use Text view for a readable equivalent." : "Okunabilir eşdeğeri için Metin görünümünü kullanın."}`}
      >
        {flat ? (
          fallback
        ) : (
          <SceneBoundary
            key={camera}
            fallback={
              <>
                <p className="scene-notice">
                  {props.lang === "en"
                    ? "3D is unavailable. The live text topology remains usable."
                    : "3D kullanılamıyor. Canlı metin topolojisi kullanılabilir."}
                </p>
                {fallback}
              </>
            }
          >
            <Suspense fallback={fallback}>
              <RuntimeWorld key={camera} {...props} />
            </Suspense>
          </SceneBoundary>
        )}
      </div>
      <div className="world-legend">
        <span>
          <i className="diamond" />
          {props.lang === "en" ? "Current task state" : "Mevcut görev durumu"}
        </span>
        <span>
          <i className="line" />
          {props.lang === "en"
            ? "Latest recorded transition"
            : "Son kaydedilen geçiş"}
        </span>
        <span>
          <i className="gate" />
          {props.lang === "en"
            ? "Human-governed boundary"
            : "İnsan denetimindeki sınır"}
        </span>
      </div>
    </>
  );
}
