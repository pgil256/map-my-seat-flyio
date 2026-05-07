/**
 * Record a sequence of PNG frames showing: initial chart -> manual drag that
 * violates a keep-apart rule (score drops red) -> click Re-optimize -> score
 * recovers. Run with the dev server already up at http://localhost:8081.
 *
 *   node frontend/scripts/record-demo.cjs
 *
 * Output: /tmp/mms-frames/frame-NNN.png
 * Then combine with ffmpeg to produce docs/screenshots/demo.gif.
 */
const puppeteer = require("puppeteer-core");
const fs = require("fs");
const path = require("path");

const URL = "http://localhost:8081/classrooms/1/seating-charts/1?demo=1";
const FRAMES_DIR = "/tmp/mms-frames";
const VIEWPORT = { width: 1280, height: 760 };

if (!fs.existsSync(FRAMES_DIR)) fs.mkdirSync(FRAMES_DIR, { recursive: true });
for (const f of fs.readdirSync(FRAMES_DIR)) fs.unlinkSync(path.join(FRAMES_DIR, f));

let frameNum = 0;
async function snap(page, copies = 1) {
  for (let i = 0; i < copies; i++) {
    const name = `frame-${String(frameNum++).padStart(3, "0")}.png`;
    await page.screenshot({ path: path.join(FRAMES_DIR, name), type: "png" });
  }
}

async function findDeskCenter(page, name) {
  return page.evaluate((n) => {
    const td = [...document.querySelectorAll("td.desk")].find((td) =>
      td.innerText.includes(n)
    );
    if (!td) return null;
    const draggable = td.querySelector('[role="button"]') || td;
    const r = draggable.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height };
  }, name);
}

async function getScore(page) {
  return page.evaluate(() => {
    const el = [...document.querySelectorAll("p, dd")].find((e) =>
      /^-?\d+$/.test(e.innerText?.trim() ?? "")
    );
    return el ? el.innerText.trim() : null;
  });
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: "/usr/bin/google-chrome",
    headless: "new",
    defaultViewport: VIEWPORT,
    args: ["--no-sandbox", "--disable-gpu", "--hide-scrollbars"],
  });
  const page = await browser.newPage();

  console.log("→ navigating");
  await page.goto(URL, { waitUntil: "networkidle0" });
  await page.waitForSelector("td.desk", { timeout: 10_000 });
  await new Promise((r) => setTimeout(r, 800));

  const initialScore = await getScore(page);
  console.log(`→ initial score: ${initialScore}`);

  // Hold the optimal arrangement for ~1.5s
  await snap(page, 15);

  // Find Mason and Liam (they have a 'separate' constraint between them).
  const mason = await findDeskCenter(page, "Mason Miller");
  const liam = await findDeskCenter(page, "Liam Smith");
  if (!mason || !liam) throw new Error("Mason or Liam not found");

  // Find the desk closest to Mason (so dropping Liam there places him
  // next to Mason and triggers the keep-apart rule). Exclude Mason
  // and Liam from candidates.
  const target = await page.evaluate(
    (ax, ay) => {
      const tds = [...document.querySelectorAll("td.desk")];
      let best = null;
      let bestDist = Infinity;
      for (const td of tds) {
        const t = td.innerText;
        if (/Mason Miller|Liam Smith/.test(t)) continue;
        const r = td.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dToMason = Math.hypot(cx - ax, cy - ay);
        if (dToMason < bestDist) {
          bestDist = dToMason;
          best = { x: cx, y: cy, name: t.split("\n")[0].trim() };
        }
      }
      return best;
    },
    mason.x,
    mason.y
  );
  if (!target) throw new Error("no target found");

  console.log(`→ Mason at (${mason.x.toFixed(0)},${mason.y.toFixed(0)})`);
  console.log(`→ Liam at  (${liam.x.toFixed(0)},${liam.y.toFixed(0)})`);
  console.log(`→ drag Liam onto ${target.name} (${target.x.toFixed(0)},${target.y.toFixed(0)}) — adjacent to Mason`);

  await page.mouse.move(liam.x, liam.y);
  await page.mouse.down();
  const steps = 10;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    await page.mouse.move(
      liam.x + (target.x - liam.x) * t,
      liam.y + (target.y - liam.y) * t,
      { steps: 1 }
    );
    if (i === 1 || i === Math.floor(steps / 2) || i === steps - 1) {
      await snap(page, 2);
    }
  }
  await page.mouse.up();
  await new Promise((r) => setTimeout(r, 250));
  const afterDragScore = await getScore(page);
  console.log(`→ after drag score: ${afterDragScore}`);

  // Hold post-drop for ~1.5s
  await snap(page, 15);

  // Click Re-optimize
  console.log("→ clicking Re-optimize");
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll("button")].find((b) => /re-optimize/i.test(b.innerText));
    btn.click();
  });
  await new Promise((r) => setTimeout(r, 500));
  const afterOptScore = await getScore(page);
  console.log(`→ after re-optimize score: ${afterOptScore}`);

  // Hold the recovered state for ~1.5s
  await snap(page, 15);

  console.log(`→ wrote ${frameNum} frames to ${FRAMES_DIR}`);
  await browser.close();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
