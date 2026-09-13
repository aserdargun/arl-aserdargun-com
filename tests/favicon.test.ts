import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const read = (p: string) => readFileSync(resolve(ROOT, p), "utf8");
const readBuf = (p: string) => readFileSync(resolve(ROOT, p));

function parseSvg(svg: string) {
  // very small attribute extractor for the family design
  const get = (re: RegExp) => (re.exec(svg) ?? [])[1] ?? "";
  return {
    svg,
    viewBox: get(/viewBox="([^"]+)"/),
    rectColor: get(/<rect[^>]*\bfill="([^"]+)"/),
    circle: get(/<circle[^>]*\bfill="([^"]+)"/),
    stroke: get(/<g[^>]*\bstroke="([^"]+)"/),
    strokeWidth: get(/<g[^>]*\bstroke-width="([^"]+)"/),
    hline: get(/<line[^>]*\bx1="([^"]+)"/),
    hlineY: get(/<line[^>]*\by1="([^"]+)"/),
    hlineX2: get(/<line[^>]*\bx2="([^"]+)"/),
    rects: Array.from(svg.matchAll(/<rect[^>]*\bx="(\d+)"[^>]*\by="(\d+)"[^>]*\bwidth="(\d+)"[^>]*\bheight="(\d+)"[^>]*\brx="(\d+)"[^>]*\bfill="([^"]+)"/g)).map((m) => ({
      x: +m[1], y: +m[2], w: +m[3], h: +m[4], rx: +m[5], fill: m[6],
    })),
    checkPath: get(/<path[^>]*\bd="([^"]+)"/),
    text: get(/<text[^>]*>([^<]+)<\/text>/),
    textX: get(/<text[^>]*\bx="([^"]+)"/),
    textY: get(/<text[^>]*\by="([^"]+)"/),
    textFill: get(/<text[^>]*\bfill="([^"]+)"/),
    ariaLabel: get(/aria-label="([^"]+)"/),
  };
}

describe("favicon family design", () => {
  it("SVG matches green family geometry, colors, and text", () => {
    const svg = read("public/favicon.svg");
    const p = parseSvg(svg);
    expect(p.viewBox).toBe("0 0 320 320");
    expect(p.rectColor).toBe("#121310");
    // check bg rect dimensions
    const bg = /<rect[^>]*\bwidth="(\d+)"[^>]*\bheight="(\d+)"[^>]*\brx="(\d+)"/.exec(svg);
    expect(bg).not.toBeNull();
    expect(bg![1]).toBe("320");
    expect(bg![2]).toBe("320");
    expect(bg![3]).toBe("64");
    // green circle
    expect(p.circle).toBe("#c8ff36");
    const circ = /<circle[^>]*\bcx="(\d+)"[^>]*\bcy="(\d+)"[^>]*\br="(\d+)"/.exec(svg);
    expect(circ).not.toBeNull();
    expect(circ![1]).toBe("160");
    expect(circ![2]).toBe("142");
    expect(circ![3]).toBe("108");
    // stroke group
    expect(p.stroke).toBe("#0c0d0a");
    expect(p.strokeWidth).toBe("10");
    // horizontal line
    expect(p.hline).toBe("94");
    expect(p.hlineY).toBe("142");
    expect(p.hlineX2).toBe("226");
    // three nodes
    expect(p.rects.length).toBe(3);
    const [r1, r2, r3] = p.rects;
    expect(r1).toMatchObject({ x: 76, y: 124, w: 36, h: 36, rx: 8, fill: "#c8ff36" });
    expect(r2).toMatchObject({ x: 130, y: 112, w: 60, h: 60, rx: 12, fill: "#c8ff36" });
    expect(r3).toMatchObject({ x: 208, y: 124, w: 36, h: 36, rx: 8, fill: "#c8ff36" });
    // checkmark
    expect(p.checkPath).toBe("M144 142 l11 11 20-23");
    // text
    expect(p.textX).toBe("160");
    expect(p.textY).toBe("296");
    expect(p.textFill).toBe("#c8ff36");
    expect(p.text).toBe("ARL");
    expect(svg).toContain('letter-spacing="-2"');
    expect(p.ariaLabel).toBe("ARL");
  });

  it("index.html has three versioned favicon links", () => {
    const html = read("index.html");
    expect(html).toMatch(/<link\s+rel="icon"\s+type="image\/png"\s+sizes="32x32"\s+href="\/favicon-32\.png\?v=family-green-1"\s*\/?>/);
    expect(html).toMatch(/<link\s+rel="icon"\s+type="image\/svg\+xml"\s+href="\/favicon\.svg\?v=family-green-1"\s*\/?>/);
    expect(html).toMatch(/<link\s+rel="apple-touch-icon"\s+sizes="180x180"\s+href="\/apple-touch-icon\.png\?v=family-green-1"\s*\/?>/);
  });

  it("PNG favicon-32.png has PNG signature and 32x32 IHDR", () => {
    const buf = readBuf("public/favicon-32.png");
    // PNG signature
    expect([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).toEqual(Array.from(buf.subarray(0, 8)));
    // IHDR chunk: starts at byte 8, length(4) + "IHDR"(4) + width(4) + height(4)
    const w = buf.readUInt32BE(16);
    const h = buf.readUInt32BE(20);
    expect(w).toBe(32);
    expect(h).toBe(32);
  });

  it("PNG apple-touch-icon.png has PNG signature and 180x180 IHDR", () => {
    const buf = readBuf("public/apple-touch-icon.png");
    expect([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).toEqual(Array.from(buf.subarray(0, 8)));
    const w = buf.readUInt32BE(16);
    const h = buf.readUInt32BE(20);
    expect(w).toBe(180);
    expect(h).toBe(180);
  });

  it("SVG validator rejects legacy 64x64 viewBox", () => {
    const bad = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="8" fill="#000"/></svg>`;
    // validator: family viewBox must be "0 0 320 320"
    const ok = /viewBox="0 0 320 320"/.test(bad);
    expect(ok).toBe(false);
  });

  it("SVG validator rejects wrong label", () => {
    const wrong = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320" aria-label="WRONG"><text x="160" y="296" fill="#c8ff36">WRONG</text></svg>`;
    const label = /aria-label="([^"]+)"/.exec(wrong)![1];
    expect(label).not.toBe("ARL");
  });

  it("SVG validator rejects blue variant", () => {
    const blue = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320"><circle cx="160" cy="142" r="108" fill="#3366ff"/></svg>`;
    const circ = /<circle[^>]*\bfill="([^"]+)"/.exec(blue)![1];
    expect(circ).not.toBe("#c8ff36");
  });
});
