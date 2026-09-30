import { ArrowUpRight, Info, ShieldAlert } from "lucide-react";
import type { Locale } from "../core/types";
import {
  boundaryDetail,
  boundaryStatement,
  evidenceSources,
  reviewCopy,
  reviewSurface,
  sourceListCopy,
} from "../lessons/evidence";

/**
 * The point-of-use boundary. It is rendered inside the inspector and the review
 * surface, next to the checks and the approve control, because that is where a
 * visitor decides whether a simulated result means something outside this page.
 */
export function BoundaryNote({ lang }: { lang: Locale }) {
  return (
    <p className="boundary-note">
      <ShieldAlert size={16} aria-hidden="true" />
      <span>
        <strong>{boundaryStatement[lang]}</strong> {boundaryDetail[lang]}
      </span>
    </p>
  );
}

export default function Methodology({ lang }: { lang: Locale }) {
  return (
    <section className="methodology" id="methodology" aria-labelledby="methodology-title">
      <div className="methodology-heading">
        <h2 id="methodology-title">{reviewCopy.heading[lang]}</h2>
        <p className="methodology-reviewed">
          <strong>{reviewCopy.linkCheckLabel[lang]}</strong>{" "}
          <code>{reviewSurface.linkCheckDate}</code> ·{" "}
          <strong>{reviewCopy.runtimeRecordLabel[lang]}</strong>{" "}
          <code>{reviewSurface.runtimeRecordDate}</code>
        </p>
      </div>
      <BoundaryNote lang={lang} />
      <p className="methodology-scope">{reviewSurface.scope[lang]}</p>
      <div className="methodology-not-verified">
        <h3>
          <Info size={15} aria-hidden="true" />
          {reviewCopy.notVerifiedHeading[lang]}
        </h3>
        <ul>
          {reviewSurface.notVerified.map((item, i) => (
            <li key={i}>{item[lang]}</li>
          ))}
        </ul>
        <p className="methodology-record-note">
          {reviewCopy.runtimeRecordNote[lang]}
        </p>
      </div>
      <div className="methodology-sources">
        <h3>{sourceListCopy.heading[lang]}</h3>
        <p className="methodology-sources-lead">{sourceListCopy.lead[lang]}</p>
        <ol>
          {evidenceSources.map((source) => (
            <li key={source.id} className="source-item">
              <h4>
                <a href={source.url} target="_blank" rel="noreferrer">
                  {source.publisher} · {source.title}
                  <ArrowUpRight size={13} />
                </a>
              </h4>
              <p className="source-claim">{source.claim[lang]}</p>
              <p>
                <span className="source-label">
                  {sourceListCopy.supportsLabel[lang]}
                </span>{" "}
                {source.supports[lang]}
              </p>
              <p>
                <span className="source-label warn">
                  {sourceListCopy.doesNotSupportLabel[lang]}
                </span>{" "}
                {source.doesNotSupport[lang]}
              </p>
              <small>
                {sourceListCopy.checkedLabel[lang]}: {reviewSurface.linkCheckDate}
              </small>
            </li>
          ))}
        </ol>
      </div>
      <div className="methodology-unsupported">
        <h3>{sourceListCopy.unsupportedTitle[lang]}</h3>
        <p>{sourceListCopy.unsupportedNote[lang]}</p>
        <ul>
          {sourceListCopy.unsupported.map((item, i) => (
            <li key={i}>{item[lang]}</li>
          ))}
        </ul>
      </div>
      <p className="methodology-footnote">
        {lang === "en"
          ? "The manifest states the same limits machine-readably: every evidence record on this site is either simulated or calculated, and none carries a real-world verification status."
          : "Manifest aynı sınırları makine tarafından okunabilir biçimde belirtir: bu sitedeki her kanıt kaydı ya simüledir ya hesaplanmıştır ve hiçbiri gerçek dünya doğrulama durumu taşımaz."}
      </p>
    </section>
  );
}
