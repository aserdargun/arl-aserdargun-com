import manifest from "../../lab.manifest.json";
import { txt, type Locale } from "../core/types";

const references = [...manifest.related.theory, ...manifest.related.labs];

// Ordinary learning links. Only the separate ILS adapter transfers context to TFL.
export function learningUrl(id: string, locale: Locale): string {
  const reference = references.find((item) => item.id === id);
  if (!reference) throw new Error(`Unknown learning destination: ${id}`);
  return reference.localizedUrls?.[locale] ?? reference.url;
}

export const portfolioUrl = (locale: Locale) =>
  locale === "tr" ? "https://aserdargun.com/tr/" : "https://aserdargun.com/";

export const learningPaths = [
  {
    id: "mem",
    title: txt(
      "Context now, memory across sessions",
      "Şimdi bağlam, oturumlar boyunca bellek",
    ),
    description: txt(
      "ARL exposes the context of each call; its scenarios start with empty memory. In MEM, explore recall, correction, expiry and deletion with synthetic records and local persistence.",
      "ARL her çağrının bağlamını gösterir; senaryoları boş bellekle başlar. MEM'de sentetik kayıtlar ve yerel kalıcılıkla geri çağırma, düzeltme, süre sonu ve silmeyi keşfedin.",
    ),
  },
  {
    id: "dpl",
    title: txt("Choose how to proceed", "Nasıl ilerleyeceğine karar ver"),
    description: txt(
      "ARL follows a fixed script. In DPL, compare policies for taking a short path, evaluating further, requesting evidence, awaiting approval or abstaining.",
      "ARL sabit bir betiği izler. DPL'de kısa yoldan ilerleme, daha fazla değerlendirme, kanıt isteme, onay bekleme veya eylemden kaçınma politikalarını karşılaştırın.",
    ),
  },
  {
    id: "cul",
    title: txt("Observe, act, verify", "Gözlemle, eyleme geç, doğrula"),
    description: txt(
      "ARL makes tool authority visible. In CUL, explore observation, interface actions and result verification in a controlled browser simulation, without operating a real desktop.",
      "ARL araç yetkisini görünür kılar. CUL'de gerçek masaüstünü yönetmeden, kontrollü tarayıcı simülasyonunda gözlem, arayüz eylemleri ve sonuç doğrulamayı keşfedin.",
    ),
  },
  {
    id: "aos",
    title: txt(
      "From a run to system architecture",
      "Bir yürütmeden sistem mimarisine",
    ),
    description: txt(
      "Explore AOS's proposed agent runtime, component responsibilities and human control. Its public site explains the target architecture; it does not run AOS or a model in this browser.",
      "AOS'nin hedef ajan çalışma ortamını, bileşen sorumluluklarını ve insan denetimini inceleyin. Tanıtım sitesi hedef mimariyi açıklar; bu tarayıcıda AOS veya model çalıştırmaz.",
    ),
  },
];
