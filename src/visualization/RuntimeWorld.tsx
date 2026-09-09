import {
  Component,
  Suspense,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Html, Line, OrbitControls } from "@react-three/drei";
import type { AgentRun, Lens, Locale, Zone } from "../core/types";
import { zoneNames } from "../lessons/content";
const positions: Record<Zone, [number, number, number]> = {
  intent: [-6, 0, -1.7],
  context: [-4, 0, -1.7],
  model: [-2, 0, -1.7],
  router: [0, 0, -1.7],
  authority: [2, 0, -1.7],
  sandbox: [4.5, 0, -1.7],
  verify: [4.5, 0, 1.5],
  evaluate: [2, 0, 1.5],
  approval: [0, 0, 1.5],
  world: [-2.6, 0, 1.5],
  audit: [-5, 0, 1.5],
};
const route = Object.keys(positions) as Zone[];
const lensZones: Record<Lens, Zone[]> = {
  hns: ["intent", "model", "router", "sandbox", "audit"],
  ctx: ["context", "model"],
  sec: ["authority", "approval", "world", "sandbox"],
  evl: ["verify", "evaluate", "audit"],
};
function Box({
  p = [0, 0, 0],
  s = [1, 1, 1],
  color = "#607993",
  opacity = 1,
}: {
  p?: number[];
  s?: number[];
  color?: string;
  opacity?: number;
}) {
  return (
    <mesh position={p as [number, number, number]}>
      <boxGeometry args={s as [number, number, number]} />
      <meshStandardMaterial
        color={color}
        transparent={opacity < 1}
        opacity={opacity}
      />
    </mesh>
  );
}
function Station({
  zone,
  run,
  lens,
  lang,
}: {
  zone: Zone;
  run: AgentRun;
  lens: Lens;
  lang: Locale;
}) {
  const active = run.zone === zone,
    visited = run.events.some((e) => e.zone === zone),
    accent =
      zone === "approval"
        ? "#c58a27"
        : active
          ? "#159f90"
          : lensZones[lens].includes(zone)
            ? "#304f70"
            : "#8a9aae";
  return (
    <group position={positions[zone]}>
      <Box
        p={[0, 0.1, 0]}
        s={[1.22, 0.18, 1]}
        color={active ? "#c6eee7" : visited ? "#d1dde7" : "#e2e8ee"}
      />
      {zone === "context" ? (
        <group>
          {[0.24, 0.42, 0.6].map((y) => (
            <mesh position={[0, y, 0]} key={y}>
              <cylinderGeometry args={[0.32, 0.32, 0.15, 24]} />
              <meshStandardMaterial color={accent} />
            </mesh>
          ))}
        </group>
      ) : zone === "authority" || zone === "approval" ? (
        <group>
          <Box p={[-0.38, 0.57, 0]} s={[0.13, 0.88, 0.18]} color={accent} />
          <Box p={[0.38, 0.57, 0]} s={[0.13, 0.88, 0.18]} color={accent} />
          <Box p={[0, 1, 0]} s={[0.9, 0.13, 0.18]} color={accent} />
          <Box
            p={[0, 0.55, 0]}
            s={[0.6, 0.7, 0.04]}
            color={accent}
            opacity={0.17}
          />
        </group>
      ) : zone === "evaluate" ? (
        <group>
          {[0.3, 0.5, 0.7].map((h, i) => (
            <Box
              key={i}
              p={[(i - 1) * 0.24, h / 2 + 0.2, 0]}
              s={[0.15, h, 0.35]}
              color={accent}
            />
          ))}
        </group>
      ) : zone === "sandbox" ? (
        <group>
          <Box p={[0, 0.2, 0]} s={[1.8, 0.1, 1.7]} color="#c9ddd9" />
          {[-0.55, 0, 0.55].map((x, i) => (
            <group key={x} position={[x, 0.3, 0]}>
              <Box s={[0.38, 0.18, 0.6]} color={accent} />
              {i === 1 ? (
                <Box p={[0, 0.19, 0]} s={[0.24, 0.2, 0.24]} color="#f1f8fa" />
              ) : (
                <Box p={[0, 0.2, 0]} s={[0.25, 0.25, 0.06]} color="#f1f8fa" />
              )}
            </group>
          ))}
        </group>
      ) : zone === "verify" ? (
        <group>
          <mesh position={[0, 0.56, 0]} rotation={[0, 0, -0.5]}>
            <torusGeometry args={[0.24, 0.07, 10, 32]} />
            <meshStandardMaterial color={accent} />
          </mesh>
          <Box p={[0.23, 0.28, 0]} s={[0.1, 0.35, 0.1]} color={accent} />
        </group>
      ) : zone === "model" ? (
        <Box p={[0, 0.47, 0]} s={[0.65, 0.65, 0.65]} color={accent} />
      ) : zone === "router" ? (
        <group>
          {[0.3, 0.5, 0.7].map((y) => (
            <Box key={y} p={[0, y, 0]} s={[0.65, 0.14, 0.5]} color={accent} />
          ))}
        </group>
      ) : (
        <group>
          <Box p={[0, 0.48, 0]} s={[0.52, 0.6, 0.08]} color={accent} />
          {[0.35, 0.47, 0.59].map((y) => (
            <Box
              key={y}
              p={[0, y, 0.05]}
              s={[0.3, 0.035, 0.01]}
              color="#eef7fb"
            />
          ))}
        </group>
      )}
      {active && (
        <mesh position={[0, 1.43, 0]}>
          <octahedronGeometry args={[0.19]} />
          <meshStandardMaterial
            color={run.status === "awaiting_approval" ? "#d59526" : "#15aa94"}
          />
        </mesh>
      )}
      <Html
        position={[0, -0.05, 0.68]}
        center
        style={{ pointerEvents: "none" }}
      >
        <span className={`world-label ${active ? "active" : ""}`}>
          {zoneNames[zone][lang]}
          {zone === "sandbox" && (
            <small>
              {lang === "en"
                ? "READ · COMPUTE · DRAFT"
                : "OKU · HESAPLA · TASLAK"}
            </small>
          )}
        </span>
      </Html>
    </group>
  );
}
function FitCamera() {
  const { camera, size, invalidate } = useThree();
  useEffect(() => {
    camera.zoom = Math.min(size.width / 16.5, size.height / 5.4);
    camera.updateProjectionMatrix();
    invalidate();
  }, [camera, size.width, size.height, invalidate]);
  return null;
}
function Scene({
  run,
  lens,
  lang,
}: {
  run: AgentRun;
  lens: Lens;
  lang: Locale;
}) {
  const previous = run.events
    .slice(0, -1)
    .reverse()
    .find((e) => e.zone !== run.zone)?.zone;
  return (
    <>
      <FitCamera />
      <color attach="background" args={["#edf3f8"]} />
      <ambientLight intensity={1.7} />
      <directionalLight position={[-3, 10, 5]} intensity={2.1} />
      <group position={[0, -0.1, 0]}>
        <Box p={[0, -0.22, 0]} s={[15, 0.28, 6.3]} color="#dae5ee" />
        <gridHelper
          scale={[0.93, 1, 0.38]}
          args={[16, 32, "#c1d1dd", "#d0dde6"]}
          position={[0, -0.065, 0]}
        />
        {route.slice(0, -1).map((z, i) => {
          const a = positions[z],
            b = positions[route[i + 1]];
          return (
            <Line
              key={z}
              points={[
                [a[0], 0.14, a[2]],
                [b[0], 0.14, a[2]],
                [b[0], 0.14, b[2]],
              ]}
              color="#a5b9ca"
              lineWidth={1.3}
              dashed
              dashSize={0.12}
              gapSize={0.12}
            />
          );
        })}
        {previous && (
          <Line
            points={[
              [positions[previous][0], 0.2, positions[previous][2]],
              [positions[run.zone][0], 0.2, positions[run.zone][2]],
            ]}
            color="#169e89"
            lineWidth={3}
          />
        )}

        <Line
          points={[
            [3.15, 0.18, -2.85],
            [5.95, 0.18, -2.85],
            [5.95, 0.18, -0.35],
            [3.15, 0.18, -0.35],
            [3.15, 0.18, -2.85],
          ]}
          color="#588f92"
          dashed
          dashSize={0.14}
          gapSize={0.1}
        />
        <Box
          p={[-1.25, 0.5, 1.5]}
          s={[0.045, 1.05, 2.1]}
          color="#d7a74e"
          opacity={0.2}
        />
        <Html position={[-1.3, 1.25, 2.45]} center>
          <span className="boundary-label">
            {lang === "en" ? "CONSEQUENTIAL BOUNDARY" : "SONUÇ DOĞURAN SINIR"}
          </span>
        </Html>
        {route.map((z) => (
          <Station key={z} zone={z} run={run} lens={lens} lang={lang} />
        ))}
      </group>
      <OrbitControls
        enablePan={false}
        minZoom={15}
        maxZoom={75}
        minPolarAngle={0.3}
        maxPolarAngle={1.1}
        target={[0, 0, 0]}
      />
    </>
  );
}
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
export default function RuntimeWorld(props: {
  run: AgentRun;
  lens: Lens;
  lang: Locale;
}) {
  const [flat, setFlat] = useState(false),
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
        role={flat ? "region" : "img"}
        aria-label={`${props.lang === "en" ? "Runtime topology. Current station" : "Çalışma topolojisi. Mevcut istasyon"}: ${zoneNames[props.run.zone][props.lang]}. ${props.lang === "en" ? "Use Text view for a readable equivalent." : "Okunabilir eşdeğeri için Metin görünümünü kullanın."}`}
      >
        {flat ? (
          fallback
        ) : (
          <SceneBoundary fallback={fallback}>
            <Suspense fallback={fallback}>
              <Canvas
                key={camera}
                orthographic
                camera={{ position: [4, 9, 18], zoom: 47 }}
                dpr={[1, 1.5]}
                frameloop="demand"
                gl={{ antialias: true, alpha: false }}
              >
                <Scene {...props} />
              </Canvas>
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
