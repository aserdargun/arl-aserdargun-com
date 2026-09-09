import {
  txt,
  type ContextItem,
  type ContextSnapshot,
  type MemoryItem,
} from "./types";
export function assembleContext(
  items: ContextItem[],
  capacity: number,
  at: number,
  memory: MemoryItem[] = [],
  includeMemory = false,
): ContextSnapshot {
  const all = [...items];
  if (includeMemory)
    all.push(
      ...memory.map((m) => ({
        id: m.id,
        kind: "MEMORY" as const,
        content: m.content,
        source: "policy-memory",
        timestamp: at,
        reason: txt(m.purpose, m.purpose),
        trust: "derived" as const,
        units: 8,
        priority: 20,
        included: false,
      })),
    );
  let used = 0;
  const selected = [...all]
    .sort((a, b) => b.priority - a.priority)
    .map((item) => {
      const included = used + item.units <= capacity;
      if (included) used += item.units;
      return {
        ...item,
        included,
        exclusion: included
          ? undefined
          : txt(
              "Excluded: synthetic context capacity exceeded",
              "Hariç: sentetik bağlam kapasitesi aşıldı",
            ),
      };
    });
  return { at, capacity, used, items: selected };
}
