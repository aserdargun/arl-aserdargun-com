import { txt, type Copy } from "../core/types";

/**
 * The site's evidence surface. Every string here is bilingual by construction.
 *
 * Rules this file has to keep:
 * - A source is concept support for a claim this site already makes. It is
 *   never a certification, a review or a conformance result for this simulator.
 * - Dates are only recorded where the repository can show where they come from:
 *   the link check below was performed by opening each URL, and the runtime date
 *   is the acceptance record in docs/QA.md. Nothing else gets a date.
 * - Claims that no consulted primary source supports stay listed as unsupported
 *   instead of being attached to a loosely related citation.
 */
export const reviewSurface = {
  /** Date on which every URL below was opened and answered HTTP 200. */
  linkCheckDate: "2026-09-30",
  /** Dated acceptance record kept in docs/QA.md for one specific local build. */
  runtimeRecordDate: "2026-09-09",
  scope: txt(
    "Reviewed: the four behavior areas this site actually simulates — human approval and authority limits, prompt injection from retrieved content, verification separated from evaluation, and the isolated/consequential boundary. Also reviewed: the chapter-to-scenario map, which is authored here and not taken from any curriculum.",
    "İncelenen: bu sitede gerçekten simüle edilen dört davranış alanı — insan onayı ve yetki sınırları, getirilen içerikten gelen istem enjeksiyonu, doğrulamanın değerlendirmeden ayrılması ve yalıtılmış/sonuç doğuran sınır. Ayrıca incelendi: bölüm-senaryo haritası; bu harita burada yazılmıştır, hiçbir müfredattan alınmamıştır.",
  ),
  notVerified: [
    txt(
      "No real agent, model, sandbox, identity provider or production system was executed, measured or compared. Every number, duration and unit on this site is synthetic.",
      "Gerçek bir ajan, model, korumalı alan, kimlik sağlayıcı veya üretim sistemi çalıştırılmadı, ölçülmedi ve karşılaştırılmadı. Bu sitedeki her sayı, süre ve birim sentetiktir.",
    ),
    txt(
      "The sources below were read as concept support. None of them reviewed, tested, audited or certifies this simulator, and none of them validates a result, a number or a check displayed here.",
      "Aşağıdaki kaynaklar kavram desteği olarak okundu. Hiçbiri bu simülatörü incelemedi, test etmedi, denetlemedi veya onaylamadı; hiçbiri burada gösterilen bir sonucu, sayıyı ya da denetimi doğrulamaz.",
    ),
    txt(
      "The retrieval ranking, the 30-unit budget, the 30-second grant expiry and the 25% figure are parameters of this educational model. They are not measurements and they are not claims about any real tool or dataset.",
      "Getirme sıralaması, 30 birimlik bütçe, 30 saniyelik izin süresi ve %25 değeri bu eğitsel modelin parametreleridir. Ölçüm değildir ve gerçek bir araç ya da veri kümesi hakkında iddia değildir.",
    ),
    txt(
      "Publication dates of the cited documents are not restated here, so no date is implied for them. Only the link check date above and the dated acceptance record are stated.",
      "Kaynak gösterilen belgelerin yayım tarihleri burada tekrarlanmaz; dolayısıyla onlar için hiçbir tarih ima edilmez. Yalnız yukarıdaki bağlantı denetleme tarihi ve tarihli kabul kaydı belirtilir.",
    ),
  ],
};

export interface EvidenceSource {
  id: string;
  publisher: string;
  title: string;
  url: string;
  /** The behavior on this site that the source is about. */
  claim: Copy;
  supports: Copy;
  doesNotSupport: Copy;
}

export const evidenceSources: EvidenceSource[] = [
  {
    id: "owasp-llm01",
    publisher: "OWASP GenAI Security Project",
    title: "LLM01:2025 Prompt Injection",
    url: "https://genai.owasp.org/llmrisk/llm01-prompt-injection/",
    claim: txt(
      "Text an agent retrieves can carry instructions that change model behavior.",
      "Ajanın getirdiği metin, model davranışını değiştirebilecek talimatlar taşıyabilir.",
    ),
    supports: txt(
      "Names prompt injection as a leading risk for LLM applications and describes indirect injection through retrieved or otherwise untrusted content. That is the concept the Prompt injection scenario illustrates.",
      "İstem enjeksiyonunu LLM uygulamalarının başlıca riski olarak adlandırır ve getirilen ya da güvenilmeyen içerik üzerinden dolaylı enjeksiyonu tanımlar. İstem enjeksiyonu senaryosunun gösterdiği kavram budur.",
    ),
    doesNotSupport: txt(
      "OWASP did not review, test or certify this simulator, and this list entry is not an OWASP assessment. It makes no statement about the refusal rules of this runtime or about how well it resists injection.",
      "OWASP bu simülatörü incelemedi, test etmedi ve onaylamadı; bu liste kaydı bir OWASP değerlendirmesi değildir. Bu çalışma zamanının red kuralları veya enjeksiyona ne kadar direndiği hakkında hiçbir şey söylemez.",
    ),
  },
  {
    id: "nist-sp-800-207",
    publisher: "NIST Computer Security Resource Center",
    title: "SP 800-207, Zero Trust Architecture",
    url: "https://csrc.nist.gov/pubs/sp/800/207/final",
    claim: txt(
      "Being reachable, or already being identified, does not by itself permit an action.",
      "Erişilebilir olmak ya da zaten kimliği bilinmek tek başına bir eyleme izin vermez.",
    ),
    supports: txt(
      "States that zero trust grants no implicit trust to assets or accounts based solely on physical or network location, and moves access decisions to policy at request time. This is the published version of the question the SEC lens asks: capability is not authority.",
      "Sıfır güvenin yalnızca fiziksel veya ağ konumuna bakarak varlıklara veya hesaplara örtülü güven vermediğini, erişim kararlarının istek anında politikaya taşındığını belirtir. SEC merceğinin sorduğu sorunun yayımlanmış hâli budur: yapabilmek, yetkili olmak değildir.",
    ),
    doesNotSupport: txt(
      "It does not evaluate ARL's delegation, permission or approval model, and it cannot make any single boundary on this site sufficient.",
      "ARL'nin devir, izin veya onay modelini değerlendirmez ve bu sitedeki tek bir sınırı yeterli sayamaz.",
    ),
  },
  {
    id: "nist-sp-800-53",
    publisher: "NIST Computer Security Resource Center",
    title: "SP 800-53 Rev. 5, Security and Privacy Controls",
    url: "https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final",
    claim: txt(
      "Authorization and least privilege are a separate concern from the action itself.",
      "Yetkilendirme ve en az ayrıcalık, eylemin kendisinden ayrı bir konudur.",
    ),
    supports: txt(
      "Publishes an access control family, the catalogue family where least-privilege and authorization requirements live. It is the concept behind keeping tool selection and authority in separate steps of this runtime.",
      "Erişim denetimi ailesini, en az ayrıcalık ve yetkilendirme gereksinimlerinin yer aldığı katalog ailesini yayımlar. Bu çalışma zamanında araç seçimi ile yetkiyi ayrı adımlarda tutmanın kavram dayanağıdır.",
    ),
    doesNotSupport: txt(
      "This is a publication record, not a conformance result. ARL does not claim to implement, map to or satisfy any control in it, and the citation carries no compliance meaning.",
      "Bu bir yayım kaydıdır; uyumluluk sonucu değildir. ARL buradaki hiçbir denetimi uyguladığını, eşlediğini veya karşıladığını iddia etmez; bu atıfın uyumluluk anlamı yoktur.",
    ),
  },
  {
    id: "openai-agents-hitl",
    publisher: "OpenAI",
    title: "Agents SDK — Human-in-the-loop",
    url: "https://openai.github.io/openai-agents-python/human_in_the_loop/",
    claim: txt(
      "Human approval can be attached to one specific tool call, before it runs.",
      "İnsan onayı, çalışmadan önce belirli bir araç çağrısına bağlanabilir.",
    ),
    supports: txt(
      "Documents marking individual tools as requiring approval and the approval flow that interrupts the run until a decision exists. It is the vendor-documentation analogue of the one-use grant on this site.",
      "Bireysel araçları onay gerektirir olarak işaretlemeyi ve karar verilene kadar yürütmeyi durduran onay akışını belgeler. Bu sitedeki tek kullanımlık iznin üretici belgelerindeki karşılığıdır.",
    ),
    doesNotSupport: txt(
      "OpenAI did not assess ARL. Approval there is a runtime mechanism, not a safety guarantee, and the exact-draft, run-bound grant modelled here is ARL's own invention.",
      "OpenAI ARL'yi değerlendirmedi. Oradaki onay bir çalışma zamanı mekanizmasıdır, güvenlik garantisi değildir; burada modellenen tam taslağa ve yürütmeye bağlı izin ARL'nin kendi tasarımıdır.",
    ),
  },
  {
    id: "gvisor",
    publisher: "gVisor project",
    title: "gVisor documentation",
    url: "https://gvisor.dev/docs/",
    claim: txt(
      "Running partially trusted work needs a real isolation layer, not a visual boundary.",
      "Kısmen güvenilmeyen işi çalıştırmak, görsel bir sınır değil gerçek bir yalıtım katmanı gerektirir.",
    ),
    supports: txt(
      "Describes an added isolation layer and a separate application kernel between containers and the host, which shows what an actual execution sandbox is made of. It is the concept behind the isolated and consequential zones in this model.",
      "Konteynerler ile ana makine arasında ek bir yalıtım katmanını ve ayrı bir uygulama çekirdeğini tanımlar; gerçek bir yürütme korumalı alanının nelerden oluştuğunu gösterir. Bu modeldeki yalıtılmış ve sonuç doğuran bölgelerin kavram dayanağıdır.",
    ),
    doesNotSupport: txt(
      "ARL has no kernel, container or process boundary. Its isolated region is a label inside an educational trace, not an operating-system sandbox.",
      "ARL'nin çekirdeği, konteyneri veya süreç sınırı yoktur. Yalıtılmış bölgesi eğitsel bir iz içindeki etikettir; işletim sistemi korumalı alanı değildir.",
    ),
  },
];

/** Labels for the sources list itself. */
export const sourceListCopy = {
  heading: txt("Primary sources, and what they do not prove", "Birincil kaynaklar ve neyi kanıtlamadıkları"),
  lead: txt(
    "ARL makes behavioral claims about authority, prompt injection and isolation. These are the primary documents behind those concepts. Every entry is concept support only, not a certification of this simulator's behavior. A citation here means the concept is documented elsewhere — never that this page reproduces, passes or validates anything those documents describe.",
    "ARL yetki, istem enjeksiyonu ve yalıtım hakkında davranışsal iddialarda bulunur. Bu kavramların arkasındaki birincil belgeler bunlardır. Her kayıt yalnızca kavram desteğidir; bu simülatörün davranışının onayı değildir. Buradaki bir atıf, kavramın başka bir yerde belgelendiği anlamına gelir — bu sayfanın o belgelerin tarif ettiği hiçbir şeyi yeniden ürettiği, geçtiği veya doğruladığı anlamına gelmez.",
  ),
  supportsLabel: txt("Supports", "Destekler"),
  doesNotSupportLabel: txt("Does not support", "Desteklemez"),
  checkedLabel: txt("Link checked", "Bağlantı denetlendi"),
  unsupportedTitle: txt(
    "Claims left without a citation",
    "Atıfsız bırakılan iddialar",
  ),
  unsupportedNote: txt(
    "No consulted primary source was found for these, so they are stated here without one rather than attached to a loosely related document.",
    "Bu iddialar için incelenen birincil kaynaklarda destek bulunamadı; bu yüzden gevşek ilişkili bir belgeye bağlamak yerine burada atıfsız belirtilirler.",
  ),
  unsupported: [
    txt(
      "The synthetic document set, the deterministic decision script and the reproduction of a run from its seed.",
      "Sentetik belge kümesi, belirlenimci karar betiği ve bir yürütmenin tohumundan yeniden üretilmesi.",
    ),
    txt(
      "The arithmetic result of the example quarters and the mapping from chapters to scenarios.",
      "Örnek çeyreklerin aritmetik sonucu ve bölümlerden senaryolara eşleme.",
    ),
    txt(
      "Any claim that a boundary here is sufficient against injection, over-permission or a hostile document. This site makes none.",
      "Buradaki bir sınırın enjeksiyona, aşırı izne veya düşmanca belgeye karşı yeterli olduğu iddiası. Bu site böyle bir iddia yapmaz.",
    ),
  ],
};

export const boundaryStatement = txt(
  "A simulation check does not validate a real-world claim.",
  "Bir simülasyon denetimi gerçek dünya iddiasını doğrulamaz.",
);

export const boundaryDetail = txt(
  "Every PASS, FAIL, refusal and approval in this laboratory is a statement about a scripted run inside this page. It is not a measurement, a certification or a security guarantee, and approving a write here says nothing about any system outside it.",
  "Bu laboratuvardaki her GEÇTİ, BAŞARISIZ, ret ve onay, bu sayfa içindeki betikli bir yürütme hakkındaki bir ifadedir. Ölçüm, sertifika veya güvenlik garantisi değildir; burada bir yazmayı onaylamak, dışındaki hiçbir sistem hakkında bir şey söylemez.",
);

export const reviewCopy = {
  heading: txt("Content review and evidence", "İçerik incelemesi ve kanıt"),
  linkCheckLabel: txt("Source links checked", "Kaynak bağlantıları denetlendi"),
  runtimeRecordLabel: txt(
    "Runtime acceptance record",
    "Çalışma zamanı kabul kaydı",
  ),
  runtimeRecordNote: txt(
    "A local acceptance record for one build, kept in the repository QA document. It is dated evidence about that build, not a claim about this one.",
    "Depodaki QA belgesinde tutulan, tek bir yapıya ait yerel kabul kaydıdır. O yapı hakkında tarihli kanıttır; bu yapı hakkında iddia değildir.",
  ),
  notVerifiedHeading: txt("What was NOT verified", "Neyin doğrulanmadığı"),
};
