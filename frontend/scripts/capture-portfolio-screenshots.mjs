import puppeteer from "puppeteer-core";

const baseUrl = process.env.SCREENSHOT_BASE_URL || "http://127.0.0.1:5177";

const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_BIN || "/usr/bin/google-chrome",
  headless: "new",
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
  defaultViewport: { width: 1280, height: 720, deviceScaleFactor: 1 },
});

const page = await browser.newPage();
page.setDefaultTimeout(15000);

async function waitForText(text) {
  await page.waitForFunction(
    (value) => document.body && document.body.innerText.includes(value),
    {},
    text
  );
}

async function clientNavigate(path) {
  await page.evaluate((nextPath) => {
    window.history.pushState({}, "", nextPath);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }, path);
}

async function clickButton(label) {
  await page.evaluate((text) => {
    const button = [...document.querySelectorAll("button")]
      .find((node) => node.textContent.trim() === text);
    if (!button) throw new Error(`Button not found: ${text}`);
    button.click();
  }, label);
}

async function settle() {
  await new Promise((resolve) => setTimeout(resolve, 700));
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

  const sx = sourceBox.x + sourceBox.width / 2;
  const sy = sourceBox.y + sourceBox.height / 2;
  const tx = targetBox.x + targetBox.width / 2;
  const ty = targetBox.y + targetBox.height / 2;

  await page.mouse.move(sx, sy);
  await page.mouse.down();
  await page.mouse.move(tx, ty, { steps: 24 });
  await page.mouse.up();
}

try {
  await page.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" });
  await waitForText("Seating charts in minutes");
  await settle();
  await page.screenshot({ path: "../docs/screenshots/landing.png" });

  await clickButton("Try the demo");
  await waitForText("Seating workspace");
  await page.waitForSelector('[data-seat-index="0"]');
  await settle();
  await page.screenshot({ path: "../docs/screenshots/seating.png" });

  await clientNavigate("/classrooms/demo_user/1");
  await waitForText("Seating preferences");
  await settle();
  await page.screenshot({ path: "../docs/screenshots/classroom.png" });

  await clientNavigate("/classrooms/1/seating-charts/1");
  await waitForText("Seating workspace");
  await page.waitForSelector('[data-seat-index="1"]');
  await dragSeat(1, 20);
  await page.waitForFunction(() => document.body.innerText.includes("violation"));
  await settle();

  const violatedSeat = await page.$('[data-seat-index="20"]');
  const violatedBox = await violatedSeat.boundingBox();
  await page.mouse.move(
    violatedBox.x + violatedBox.width / 2,
    violatedBox.y + violatedBox.height / 2
  );
  await new Promise((resolve) => setTimeout(resolve, 400));
  await page.screenshot({ path: "../docs/screenshots/violation.png" });
} finally {
  await browser.close();
}
