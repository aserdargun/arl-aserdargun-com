import { ArrowUpRight } from "lucide-react";
import type { Locale } from "../core/types";
import { learningPaths, learningUrl, portfolioUrl } from "../lessons/ecosystem";

export default function LearningPaths({ lang }: { lang: Locale }) {
  const t = (en: string, tr: string) => (lang === "en" ? en : tr);
  return (
    <section className="learning-paths" aria-labelledby="learning-paths-title">
      <div className="learning-paths-heading">
        <h2 id="learning-paths-title">
          {t(
            "Continue through the learning system",
            "Öğrenme sisteminde devam edin",
          )}
        </h2>
        <a href={portfolioUrl(lang)} target="_blank" rel="noreferrer">
          {t("All applications", "Tüm uygulamalar")} <ArrowUpRight size={15} />
        </a>
      </div>
      <p className="learning-paths-note">
        {t(
          "Explore a related question in an independent application. These links carry no run, documents or approvals. MEM, DPL and CUL offer their own language controls.",
          "İlgili bir soruyu bağımsız bir uygulamada keşfedin. Bu bağlantılar yürütme, belge veya onay taşımaz. MEM, DPL ve CUL'de dili kendi arayüzlerinden seçebilirsiniz.",
        )}
      </p>
      <div className="learning-paths-grid">
        {learningPaths.map((path) => (
          <article key={path.id}>
            <span className="learning-path-code">{path.id.toUpperCase()}</span>
            <h3>{path.title[lang]}</h3>
            <p>{path.description[lang]}</p>
            <a
              href={learningUrl(path.id, lang)}
              target="_blank"
              rel="noreferrer"
            >
              {t("Explore", "İncele")} {path.id.toUpperCase()}{" "}
              <ArrowUpRight size={14} />
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
