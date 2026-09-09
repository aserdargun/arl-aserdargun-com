import { txt, type Copy, type Lens, type Zone } from "../core/types";
export const lenses: Record<
  Lens,
  { name: Copy; question: Copy; lesson: Copy; url: string }
> = {
  hns: {
    name: txt("Harness", "Koşum"),
    question: txt("How does the agent run?", "Ajan nasıl çalışıyor?"),
    lesson: txt(
      "The harness coordinates decisions, tools, state, retries and stopping rules. Observability records what happened; it does not establish correctness.",
      "Koşum; kararları, araçları, durumu, yeniden denemeleri ve durma kurallarını koordine eder. Gözlemlenebilirlik ne olduğunu kaydeder; doğruluğu kanıtlamaz.",
    ),
    url: "https://hns.aserdargun.com",
  },
  ctx: {
    name: txt("Context", "Bağlam"),
    question: txt(
      "What information drives this decision?",
      "Bu kararı hangi bilgi yönlendiriyor?",
    ),
    lesson: txt(
      "Context is information supplied to a model call. Memory persists under policy. State is the authoritative workflow condition. These are different things.",
      "Bağlam, model çağrısına sunulan bilgidir. Bellek, politika kapsamında kalıcıdır. Durum, iş akışının yetkili kaydıdır. Bunlar farklı şeylerdir.",
    ),
    url: "https://ctx.aserdargun.com",
  },
  sec: {
    name: txt("Security", "Güvenlik"),
    question: txt(
      "Capability is not authority.",
      "Yapabilmek, yetkili olmak değildir.",
    ),
    lesson: txt(
      "Authorization checks subject, purpose, resource, action and expiry. Identity alone grants no permission. Human approval does not remove every risk.",
      "Yetkilendirme; özne, amaç, kaynak, eylem ve süreyi denetler. Kimlik tek başına izin vermez. İnsan onayı tüm riskleri kaldırmaz.",
    ),
    url: "https://sec.aserdargun.com",
  },
  evl: {
    name: txt("Evaluation", "Değerlendirme"),
    question: txt("Should we trust the result?", "Sonuca güvenmeli miyiz?"),
    lesson: txt(
      "Verification checks evidence and arithmetic. Evaluation checks the task contract. An unchecked requirement never silently becomes a pass.",
      "Doğrulama, kanıtı ve aritmetiği denetler. Değerlendirme, görev sözleşmesini denetler. Denetlenmemiş gereksinim sessizce geçmiş sayılmaz.",
    ),
    url: "https://evl.aserdargun.com",
  },
};
export const zoneNames: Record<Zone, Copy> = {
  intent: txt("Intent", "Niyet"),
  context: txt("Context", "Bağlam"),
  model: txt("Model", "Model"),
  router: txt("Tool router", "Araç yönlendirici"),
  authority: txt("Authority", "Yetki"),
  sandbox: txt("Sandbox", "Yalıtılmış alan"),
  verify: txt("Verify", "Doğrula"),
  evaluate: txt("Evaluate", "Değerlendir"),
  approval: txt("Human approval", "İnsan onayı"),
  world: txt("Report", "Rapor"),
  audit: txt("Audit", "Denetim izi"),
};
export const statuses: Record<string, Copy> = {
  ready: txt("Ready to run", "Başlamaya hazır"),
  running: txt("Execution in progress", "Yürütme sürüyor"),
  awaiting_approval: txt("Awaiting human approval", "İnsan onayı bekleniyor"),
  needs_review: txt("Evidence needs review", "Kanıtlar incelenmeli"),
  failed: txt("Execution stopped", "Yürütme durdu"),
  denied: txt("Action denied", "Eylem reddedildi"),
  complete: txt("Run complete", "Yürütme tamamlandı"),
};
export const checkNames: Record<string, Copy> = {
  pass: txt("Pass", "Geçti"),
  fail: txt("Fail", "Başarısız"),
  not_checked: txt("Not checked", "Denetlenmedi"),
  warning: txt("Warning", "Uyarı"),
};
export const chapters: { zone: Zone; title: Copy; body: Copy; try: Copy }[] = [
  {
    zone: "intent",
    title: txt("Intent", "Niyet"),
    body: txt(
      "Separate the objective from the constraint: prepare an update; do not change the report without approval. The human defines the purpose.",
      "Amaç ile kısıtı ayır: güncelleme hazırla; onay olmadan raporu değiştirme. Amacı insan belirler.",
    ),
    try: txt(
      "Find the no-write constraint in the task.",
      "Görevdeki yazmama kısıtını bul.",
    ),
  },
  {
    zone: "context",
    title: txt("Context", "Bağlam"),
    body: txt(
      "The model sees only assembled information. Open CTX to inspect sources, trust labels and inclusion reasons. Capacity is synthetic, not a model token limit.",
      "Model yalnızca derlenen bilgileri görür. Kaynakları, güven etiketlerini ve dahil edilme nedenlerini CTX ile incele. Kapasite sentetiktir; model token sınırı değildir.",
    ),
    try: txt(
      "Compare context before and after a document read.",
      "Belge okuması öncesi ve sonrası bağlamı karşılaştır.",
    ),
  },
  {
    zone: "model",
    title: txt("Decide", "Karar"),
    body: txt(
      "ARL uses a deterministic script as its model adapter. Decisions are visible and repeatable; no live LLM or hidden reasoning is simulated.",
      "ARL model bağdaştırıcısı olarak deterministik betik kullanır. Kararlar görünür ve tekrarlanabilirdir; canlı LLM veya gizli muhakeme taklit edilmez.",
    ),
    try: txt(
      "Inspect the context captured for a model call.",
      "Bir model çağrısı için kaydedilen bağlamı incele.",
    ),
  },
  {
    zone: "router",
    title: txt("Tool", "Araç"),
    body: txt(
      "A tool offers a capability through explicit input and output shapes. Selecting a tool does not authorize it. A successful return does not verify the contents.",
      "Araç, açık girdi ve çıktı biçimleriyle bir yetenek sunar. Aracı seçmek onu yetkilendirmez. Başarılı dönüş içeriği doğrulamaz.",
    ),
    try: txt(
      "Find why calculator was selected.",
      "Hesaplayıcının neden seçildiğini bul.",
    ),
  },
  {
    zone: "authority",
    title: txt("Authority", "Yetki"),
    body: txt(
      "The user delegates a purpose to an agent. The tool asks for an action on a resource. Authority checks identity, purpose, exact scope and expiry separately from the model decision.",
      "İnsan ajana bir amaç devreder. Araç, kaynak üzerinde eylem ister. Yetki denetimi kimlik, amaç, tam kapsam ve süreyi model kararından ayrı inceler.",
    ),
    try: txt(
      "Locate the missing report:write permission.",
      "Eksik report:write iznini bul.",
    ),
  },
  {
    zone: "sandbox",
    title: txt("Sandbox", "Yalıtılmış alan"),
    body: txt(
      "Reading, calculation and drafting happen in an isolated simulated workspace. Writing and sending cross a consequential boundary. This visual boundary is an educational abstraction, not an operating-system sandbox.",
      "Okuma, hesap ve taslak yalıtılmış simüle alanda gerçekleşir. Yazma ve gönderme sonuç doğuran sınırı geçer. Bu görsel sınır eğitsel soyutlamadır; işletim sistemi korumalı alanı değildir.",
    ),
    try: txt(
      "Inspect which tool has a consequential side effect.",
      "Hangi aracın sonuç doğuran yan etkisi olduğunu incele.",
    ),
  },
  {
    zone: "sandbox",
    title: txt("Result", "Sonuç"),
    body: txt(
      "Every tool result retains its call, timestamp, status and verification state. Try a temporary failure to see bounded retries; a persistent timeout stops after two retries.",
      "Her araç sonucu çağrısını, zamanını, durumunu ve doğrulama durumunu korur. Sınırlı yeniden denemeyi görmek için geçici hatayı dene; sürekli zaman aşımı iki yeniden denemede durur.",
    ),
    try: txt(
      "Run the temporary tool failure scenario.",
      "Geçici araç hatası senaryosunu çalıştır.",
    ),
  },
  {
    zone: "verify",
    title: txt("Verify", "Doğrula"),
    body: txt(
      "Deterministic checks compare source quarters, revisions, numbers, arithmetic and citations. The independent formula yields (150 − 120) / 120 × 100 = 25%.",
      "Deterministik denetimler kaynak çeyreklerini, sürümleri, sayıları, aritmetiği ve alıntıları karşılaştırır. Bağımsız formül (150 − 120) / 120 × 100 = %25 verir.",
    ),
    try: txt(
      "Inject a wrong calculation and find the failed check.",
      "Yanlış hesaplama ekle ve başarısız denetimi bul.",
    ),
  },
  {
    zone: "evaluate",
    title: txt("Evaluate", "Değerlendir"),
    body: txt(
      "Evaluation asks whether the outcome satisfies the revenue-update contract. Evidence failures stop the run before approval. A trace records an error; it cannot turn the error into a correct outcome.",
      "Değerlendirme, sonucun gelir güncelleme sözleşmesini karşılayıp karşılamadığını sorar. Kanıt hataları yürütmeyi onaydan önce durdurur. İz hatayı kaydeder; doğru sonuca dönüştüremez.",
    ),
    try: txt(
      "Run Bad evidence and inspect the failed quarter check.",
      "Hatalı kanıtı çalıştır ve başarısız çeyrek denetimini incele.",
    ),
  },
  {
    zone: "approval",
    title: txt("Approve", "Onay"),
    body: txt(
      "HITL: review this exact write and approve once or deny. HOTL: supervise playback and pause to inspect. HIC: the human owns purpose, policy and approval rules. These are overlapping governance patterns, not universal categories.",
      "HITL: bu yazmayı incele, bir kez onayla veya reddet. HOTL: yürütmeyi gözet ve incelemek için duraklat. HIC: amaç, politika ve onay kuralları insanın denetimindedir. Bunlar örtüşebilen yönetişim desenleridir; evrensel sınıflar değildir.",
    ),
    try: txt(
      "Review the action, evidence and target before approving once.",
      "Bir kez onaylamadan önce eylemi, kanıtı ve hedefi incele.",
    ),
  },
  {
    zone: "world",
    title: txt("Commit", "Uygula"),
    body: txt(
      "The runtime rechecks authority and consumes the one-use grant. Only the approved draft is written, once. This changes the simulated report; no real document or external service is modified.",
      "Çalışma motoru yetkiyi yeniden denetler ve tek kullanımlık izni tüketir. Yalnızca onaylanan taslak bir kez yazılır. Simüle rapor değişir; gerçek belge veya dış servis değiştirilmez.",
    ),
    try: txt(
      "Check that base permissions did not expand.",
      "Temel izinlerin genişlemediğini denetle.",
    ),
  },
  {
    zone: "audit",
    title: txt("Audit", "Denetim izi"),
    body: txt(
      "The run retains ordered events, context snapshots, policy decisions, approvals and evidence. Rewind inspects history without re-executing side effects. Export contains synthetic data only.",
      "Yürütme sıralı olayları, bağlam anlık görüntülerini, politika kararlarını, onayları ve kanıtları korur. Geri sarma yan etkileri yeniden yürütmeden geçmişi inceler. Dışa aktarım yalnızca sentetik veri içerir.",
    ),
    try: txt(
      "Rewind to authorization and switch all four lenses.",
      "Yetkilendirmeye geri sar ve dört mercek arasında geçiş yap.",
    ),
  },
];
