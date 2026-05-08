import fs from "node:fs/promises";
import path from "node:path";
import puppeteer from "puppeteer-core";

const baseUrl = process.env.SCREENSHOT_BASE_URL || "http://127.0.0.1:5177";
const downloadPath = "/tmp/map-my-seat-downloads";

const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_BIN || "/usr/bin/google-chrome",
  headless: "new",
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
  defaultViewport: { width: 1280, height: 720, deviceScaleFactor: 1 },
});

const page = await browser.newPage();
page.setDefaultTimeout(15000);

const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("console", (message) => {
  if (message.type() === "error") errors.push(message.text());
});

const cdp = await page.target().createCDPSession();
await fs.rm(downloadPath, { recursive: true, force: true });
await fs.mkdir(downloadPath, { recursive: true });
await cdp.send("Page.setDownloadBehavior", {
  behavior: "allow",
  downloadPath,
});

async function waitForText(text) {
  await page.waitForFunction(
    (value) => document.body && document.body.innerText.includes(value),
    {},
    text
  );
}

async function assertText(text) {
  const hasText = await page.evaluate(
    (value) => document.body && document.body.innerText.includes(value),
    text
  );
  if (!hasText) throw new Error(`Expected page text: ${text}`);
}

async function clientNavigate(route) {
  await page.evaluate((nextPath) => {
    window.history.pushState({}, "", nextPath);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }, route);
}

async function clickButton(label) {
  await page.evaluate((text) => {
    const button = [...document.querySelectorAll("button")]
      .find((node) => node.textContent.trim() === text);
    if (!button) throw new Error(`Button not found: ${text}`);
    button.click();
  }, label);
}

async function dragSeat(sourceIndex, targetIndex) {
  const source = await page.$(`[data-seat-index="${sourceIndex}"]`);
  const target = await page.$(`[data-seat-index="${targetIndex}"]`);
  if (!source || !target) {
    throw new Error(`Missing source or target seat ${sourceIndex}->${targetIndex}`);
  }

  const sourceBox = await source.boundingBox();
  const targetBox = await target.boundingBox();
  if (!sourceBox || !targetBox) throw new Error("Seat bounding box missing");

  await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2, {
    steps: 24,
  });
  await page.mouse.up();
}

async function waitForDownload(fileName) {
  const target = path.join(downloadPath, fileName);
  const started = Date.now();
  while (Date.now() - started < 15000) {
    try {
      const stats = await fs.stat(target);
      if (stats.size > 1000) return;
    } catch {
      // Keep polling until the download appears.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Download not found: ${target}`);
}

try {
  await page.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" });
  await waitForText("Seating charts in minutes");

  await clickButton("Try the demo");
  await waitForText("Seating workspace");
  await page.waitForSelector('[data-seat-index="0"]');
  await assertText("95");
  await assertText("No keep-apart violations");

  await page.evaluate(() => {
    window.__printCalled = false;
    window.print = () => {
      window.__printCalled = true;
    };
  });
  await clickButton("Print");
  await page.waitForFunction(() => window.__printCalled === true);

  await clickButton("Export PDF");
  await waitForDownload("seating-chart.pdf");

  await dragSeat(1, 20);
  await waitForText("1 keep-apart violation");

  await clickButton("Re-optimize");
  await waitForText("No keep-apart violations");

  await clientNavigate("/periods/1");
  await waitForText("Add Student Rosters");
  await assertText("Roster");
  await assertText("Emma Johnson");
  await assertText("Seating Rules");

  await clientNavigate("/classrooms/demo_user/1");
  await waitForText("Classroom Setup");
  await assertText("Room layout");
  await assertText("Student Desks: 27");

  if (errors.length > 0) {
    throw new Error(`Browser console errors: ${errors.join(" | ")}`);
  }

  console.log("Demo flow verified");
} finally {
  await browser.close();
}
