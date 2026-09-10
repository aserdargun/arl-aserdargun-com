import {
  CheckCircle2,
  Circle,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  ArrowUpRight,
  FileText,
} from "lucide-react";
import type { AgentRun, Lens, Locale, VerificationCheck } from "../core/types";
import { checkNames, lenses, statuses, zoneNames } from "../lessons/content";
import { tools } from "../core/scenarios";
export function CheckList({
  checks,
  lang,
}: {
  checks: VerificationCheck[];
  lang: Locale;
}) {
  return (
    <div className="checks">
      {checks.map((c) => (
        <details key={c.id} className={`check ${c.status}`}>
          <summary>
            {c.status === "pass" ? (
              <CheckCircle2 size={16} />
            ) : c.status === "fail" ? (
              <XCircle size={16} />
            ) : c.status === "warning" ? (
              <AlertTriangle size={16} />
            ) : (
              <Circle size={16} />
            )}
            <span>{c.label[lang]}</span>
            <b>{checkNames[c.status][lang]}</b>
          </summary>
          <p>{c.detail[lang]}</p>
          <code>{c.evidence.join(" · ") || "—"}</code>
        </details>
      ))}
    </div>
  );
}
function Field({
  name,
  children,
}: {
  name: string;
  children: React.ReactNode;
}) {
  return (
    <div className="field">
      <span className="field-label">{name}</span>
      <div>{children}</div>
    </div>
  );
}
export default function Inspector({
  run,
  lens,
  lang,
  onReview,
  onDeny,
  isLive,
}: {
  run: AgentRun;
  lens: Lens;
  lang: Locale;
  onReview: () => void;
  onDeny: () => void;
  isLive: boolean;
}) {
  const t = (en: string, tr: string) => (lang === "en" ? en : tr),
    e = run.events.at(-1),
    decision = run.decisions.at(-1),
    call = run.toolCalls.at(-1),
    meta = lenses[lens];
  return (
    <aside
      className={`inspector lens-${lens}`}
      aria-label={t("Run inspector", "Yürütme inceleyici")}
    >
      <div className="inspector-title">
        <span>
          {lens.toUpperCase()} / {t("INSPECTOR", "İNCELEYİCİ")}
        </span>
        <code>t + {(run.budget.elapsedMs / 1000).toFixed(1)}s</code>
      </div>
      <h2>{meta.question[lang]}</h2>
      <div className="inspector-content">
        {lens === "hns" && (
          <>
            <Field name={t("CURRENT STATE", "MEVCUT DURUM")}>
              <strong>{statuses[run.status][lang]}</strong>
              <p>
                {e?.title[lang] ??
                  t(
                    "Start the revenue task, then inspect every transition.",
                    "Gelir görevini başlat, ardından her geçişi incele.",
                  )}
              </p>
            </Field>
            <div className="metric-grid">
              <Field name={t("MODEL CALLS", "MODEL ÇAĞRISI")}>
                {run.budget.modelCalls}
              </Field>
              <Field name={t("TOOL ATTEMPTS", "ARAÇ DENEMESİ")}>
                {run.budget.toolCalls}
              </Field>
              <Field name={t("RETRIES", "YENİDEN DENEME")}>
                {run.budget.retries}
              </Field>
              <Field name={t("SIMULATED TIME", "SİMÜLE SÜRE")}>
                {(run.budget.elapsedMs / 1000).toFixed(1)}s
              </Field>
            </div>
            <Field name={t("EXECUTION BUDGET", "YÜRÜTME BÜTÇESİ")}>
              <div className="budget-label">
                <strong>
                  {run.budget.used} / {run.budget.limit}
                </strong>
                <span>{t("synthetic units", "sentetik birim")}</span>
              </div>
              <meter
                aria-label={t("Execution budget", "Yürütme bütçesi")}
                value={run.budget.used}
                max={run.budget.limit}
              />
              <p>
                {t(
                  "1 unit per model call or tool attempt. No currency pricing.",
                  "Model çağrısı veya araç denemesi başına 1 birim. Para birimi fiyatlaması yok.",
                )}
              </p>
            </Field>
            {call && (
              <details open>
                <summary>
                  {call.tool} <span className="muted">{call.status}</span>
                </summary>
                <p>{call.reason[lang]}</p>
                <Field name={t("INPUT", "GİRDİ")}>
                  <pre>{JSON.stringify(call.input, null, 2)}</pre>
                </Field>
                <Field name={t("OUTPUT", "ÇIKTI")}>
                  <pre>
                    {call.output === undefined
                      ? t("Not returned", "Henüz dönmedi")
                      : JSON.stringify(call.output, null, 2)}
                  </pre>
                </Field>
                <p>
                  {t("Attempt", "Deneme")} {call.attempt} ·{" "}
                  {t("Verification", "Doğrulama")}:{" "}
                  {checkNames[call.verification][lang]}
                </p>
                <details>
                  <summary>
                    {t("Tool contract & boundary", "Araç sözleşmesi ve sınır")}
                  </summary>
                  <pre>{JSON.stringify(tools[call.tool], null, 2)}</pre>
                </details>
              </details>
            )}
            <details>
              <summary>
                {t("Authoritative workflow state", "Yetkili iş akışı durumu")}
              </summary>
              <pre>
                {JSON.stringify(
                  {
                    step: run.currentStep,
                    phase: run.phase,
                    zone: run.zone,
                    selected: run.state.selected,
                    values: run.state.values,
                    writeCount: run.state.writeCount,
                  },
                  null,
                  2,
                )}
              </pre>
            </details>
          </>
        )}
        {lens === "ctx" && (
          <>
            <Field name={t("CONTEXT COMPILER", "BAĞLAM DERLEYİCİ")}>
              <div className="budget-label">
                <strong>
                  {run.context.used} / {run.context.capacity}
                </strong>
                <span>{t("synthetic capacity", "sentetik kapasite")}</span>
              </div>
              <meter
                aria-label={t("Context capacity", "Bağlam kapasitesi")}
                value={run.context.used}
                max={run.context.capacity}
              />
              <p>
                {run.context.capacity - run.context.used}{" "}
                {t("available", "kullanılabilir")} ·{" "}
                {run.context.items.filter((i) => !i.included).length}{" "}
                {t("excluded", "hariç")}
              </p>
            </Field>
            {!run.context.items.length && (
              <p className="empty">
                {t(
                  "No context yet. Step to context assembly.",
                  "Henüz bağlam yok. Bağlam derleme adımına ilerle.",
                )}
              </p>
            )}
            {run.context.items.map((i) => (
              <details key={i.id} className={`context-item ${i.trust}`}>
                <summary>
                  <span className="kind">{i.kind}</span>
                  <span>{i.source}</span>
                  <b>{i.included ? t("IN", "DAHİL") : t("OUT", "HARİÇ")}</b>
                </summary>
                <p className="source-content">{i.content[lang]}</p>
                <Field
                  name={t("WHY INCLUDED / EXCLUDED", "DAHİL / HARİÇ NEDENİ")}
                >
                  {i.included ? i.reason[lang] : i.exclusion?.[lang]}
                </Field>
                <p>
                  {t("Trust", "Güven")}: <code>{i.trust}</code>
                  <br />
                  {t("Added", "Eklendi")}: {(i.timestamp / 1000).toFixed(1)}s ·{" "}
                  {i.units} {t("units", "birim")}
                  <br />
                  {t("Related call", "İlgili çağrı")}:{" "}
                  <code>{i.toolCall ?? "—"}</code>
                </p>
              </details>
            ))}
            <details>
              <summary>
                {t("Context ≠ memory ≠ state", "Bağlam ≠ bellek ≠ durum")}
              </summary>
              <p>{meta.lesson[lang]}</p>
              <Field name={t("MEMORY", "BELLEK")}>
                {run.memory.length}{" "}
                {t("run-local memory items.", "yürütmeye ait bellek öğesi.")}{" "}
                {run.policy.includeMemory
                  ? t(
                      "Policy permits insertion within capacity.",
                      "Politika kapasite içinde eklemeye izin veriyor.",
                    )
                  : t(
                      "Policy does not insert memory.",
                      "Politika belleği dahil etmiyor.",
                    )}
              </Field>
              <Field name={t("STATE", "DURUM")}>
                {zoneNames[run.zone][lang]} / {statuses[run.status][lang]}
              </Field>
            </details>
            {run.modelCalls.map((m) => (
              <details key={m.id}>
                <summary>
                  {m.id} ·{" "}
                  {t("exact invocation context", "çağrının tam bağlamı")}
                </summary>
                <p>{m.decision[lang]}</p>
                <p>
                  {m.context.items
                    .filter((i) => i.included)
                    .map((i) => i.source)
                    .join(" + ")}
                </p>
                <pre>{JSON.stringify(m.context, null, 2)}</pre>
              </details>
            ))}
          </>
        )}
        {lens === "sec" && (
          <>
            <Field name={t("REQUESTED ACTION", "İSTENEN EYLEM")}>
              <strong>
                <code>{decision?.action ?? "—"}</code>
              </strong>
            </Field>
            <Field name={t("TARGET RESOURCE", "HEDEF KAYNAK")}>
              <strong>
                {decision?.resource ?? t("No request yet", "Henüz istek yok")}
              </strong>
            </Field>
            <Field name={t("CURRENT AUTHORITY", "MEVCUT YETKİ")}>
              <ul className="permissions">
                {run.delegatedAuthority.permissions.map((p) => (
                  <li key={p.action}>
                    <ShieldCheck size={15} />
                    <code>{p.action}</code>
                  </li>
                ))}
              </ul>
            </Field>
            {decision && (
              <div className={`decision ${decision.decision}`}>
                <strong>
                  {decision.decision === "allow"
                    ? t("Authorization granted", "Yetki verildi")
                    : t("Authorization denied", "Yetki reddedildi")}
                </strong>
                <p>{decision.reason[lang]}</p>
              </div>
            )}
            {run.approvals.length > 0 && (
              <Field name={t("ONE-USE GRANT", "TEK KULLANIMLIK İZİN")}>
                <code>{run.approvals.at(-1)!.decision}</code> ·{" "}
                {run.approvals.at(-1)!.consumed
                  ? t("consumed", "tüketildi")
                  : t("not consumed", "tüketilmedi")}
              </Field>
            )}
            <details>
              <summary>
                {t(
                  "Identity & delegation chain",
                  "Kimlik ve yetki devri zinciri",
                )}
              </summary>
              <p>
                human-policy-owner → agent-revenue → {call?.tool ?? "tool"} →{" "}
                {decision?.resource ?? "resource"}
              </p>
              <Field name={t("PURPOSE", "AMAÇ")}>
                {run.delegatedAuthority.purpose}
              </Field>
              <Field name={t("CREDENTIAL", "KİMLİK BİLGİSİ")}>
                {run.delegatedAuthority.credential}
              </Field>
              <Field name={t("EXPIRY", "SON GEÇERLİLİK")}>
                t + {run.delegatedAuthority.expiresAt / 1000}s (
                {t("simulation clock", "simülasyon saati")})
              </Field>
              <p>
                {t(
                  "Permissions match exact actions and resources. This is a simulator, not an identity provider.",
                  "İzinler tam eylem ve kaynakları eşleştirir. Bu bir simülatördür; kimlik sağlayıcısı değildir.",
                )}
              </p>
            </details>
            <details>
              <summary>
                {t("Policy decision history", "Politika karar geçmişi")} (
                {run.decisions.length})
              </summary>
              {run.decisions.map((d, i) => (
                <p key={i}>
                  <code>{d.action}</code> · {d.decision}
                  <br />
                  {d.reason[lang]}
                </p>
              ))}
            </details>
          </>
        )}
        {lens === "evl" && (
          <>
            <p>
              {t(
                "Evidence checks are separate from outcome and authority checks.",
                "Kanıt denetimleri, sonuç ve yetki denetimlerinden ayrıdır.",
              )}
            </p>
            <Field name={t("VERIFICATION · EVIDENCE", "DOĞRULAMA · KANIT")}>
              {run.verification.length ? (
                <CheckList checks={run.verification} lang={lang} />
              ) : (
                <p className="empty">
                  {t(
                    "Not checked. No verification has run at this event.",
                    "Denetlenmedi. Bu olayda henüz doğrulama yapılmadı.",
                  )}
                </p>
              )}
            </Field>
            <Field
              name={t(
                "EVALUATION · TASK CONTRACT",
                "DEĞERLENDİRME · GÖREV SÖZLEŞMESİ",
              )}
            >
              {run.evaluations.length ? (
                <CheckList checks={run.evaluations} lang={lang} />
              ) : (
                <p className="empty">
                  {t(
                    "Not checked. Awaiting evidence verification.",
                    "Denetlenmedi. Kanıt doğrulaması bekleniyor.",
                  )}
                </p>
              )}
            </Field>
            <Field name={t("SUPPORTING EVIDENCE", "DESTEKLEYEN KANIT")}>
              {run.evidence.map((e) => (
                <div key={e.id} className="evidence-row">
                  <FileText size={16} />
                  <div>
                    <strong>
                      {e.quarter} · {e.value}
                    </strong>
                    <code>
                      [{e.id}] · {e.revision}
                    </code>
                    <small>
                      {e.callId} · t + {e.at / 1000}s
                    </small>
                  </div>
                </div>
              ))}
              {!run.evidence.length && <p>—</p>}
            </Field>
          </>
        )}
        {run.state.draft && (
          <details className="draft-preview" open={run.status === "complete"}>
            <summary>
              {t("Draft & simulated report", "Taslak ve simüle rapor")}
            </summary>
            <Field name={t("DRAFT", "TASLAK")}>
              <p>{run.state.draft}</p>
            </Field>
            <Field name={t("REPORT RESOURCE", "RAPOR KAYNAĞI")}>
              <p>{run.state.report}</p>
            </Field>
            <strong>
              {t("Writes", "Yazma")}: {run.state.writeCount}
            </strong>
          </details>
        )}
      </div>
      {lens === "sec" && run.status === "awaiting_approval" && (
        <div className="approval-inline">
          <strong>
            <AlertTriangle size={17} />
            {t("Human approval required", "İnsan onayı gerekli")}
          </strong>
          <p>
            {t(
              "A verified draft is ready. Review the exact action before granting one use.",
              "Doğrulanmış taslak hazır. Tek kullanımlık izin vermeden tam eylemi incele.",
            )}
          </p>
          <div className="button-row">
            <button className="primary" onClick={onReview} disabled={!isLive}>
              {t("Review action", "Eylemi incele")}
            </button>
            <button onClick={onDeny} disabled={!isLive}>
              {t("Deny", "Reddet")}
            </button>
          </div>
          {!isLive && (
            <p>
              {t(
                "Historical snapshot. Return to latest to act.",
                "Geçmiş anlık görüntü. Eylem için son olaya dön.",
              )}
            </p>
          )}
        </div>
      )}
      <a
        className="theory-link"
        href={meta.url}
        target="_blank"
        rel="noreferrer"
      >
        {t("Learn the theory", "Teoriyi öğren")} → {lens.toUpperCase()}
        <ArrowUpRight size={15} />
      </a>
    </aside>
  );
}
