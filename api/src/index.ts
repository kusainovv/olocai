import { Hono } from "hono";
import { chromium, Browser, Page } from "playwright";

const app = new Hono();

let browser: Browser | null = null;
let page: Page | null = null;

async function getPage() {
  if (!browser) {
    browser = await chromium.launch({
      headless: false,
    });
  }

  if (!page) {
    page = await browser.newPage();
  }

  return page;
}

app.get("/", (c) => c.text("API is working"));

app.post("/action", async (c) => {
  const body = await c.req.json();

  const {
    type,
    url,
    selector,
    text,
    key,
  }: {
    type: "goto" | "inspect" | "type" | "press" | "click" | "extractText";
    url?: string;
    selector?: string;
    text?: string;
    key?: string;
  } = body;

  const page = await getPage();

  if (type === "goto") {
    if (!url) {
      return c.json({ ok: false, error: "url is required" }, 400);
    }

    await page.goto(url, { waitUntil: "domcontentloaded" });

    return c.json({
      ok: true,
      type,
      url,
      title: await page.title(),
    });
  }

  if (type === "inspect") {
    return c.json({
      ok: true,
      type,
      url: page.url(),
      title: await page.title(),
      html: await page.content(),
    });
  }

  if (type === "type") {
    if (!selector || text === undefined) {
      return c.json(
        { ok: false, error: "selector and text are required" },
        400,
      );
    }

    await page.fill(selector, text);

    return c.json({
      ok: true,
      type,
      selector,
      text,
    });
  }

  if (type === "press") {
    if (!key) {
      return c.json({ ok: false, error: "key is required" }, 400);
    }

    await page.keyboard.press(key);

    return c.json({
      ok: true,
      type,
      key,
    });
  }

  if (type === "click") {
    if (!selector) {
      return c.json({ ok: false, error: "selector is required" }, 400);
    }

    await page.click(selector);

    return c.json({
      ok: true,
      type,
      selector,
    });
  }

  if (type === "extractText") {
    if (!selector) {
      return c.json({ ok: false, error: "selector is required" }, 400);
    }

    const extractedText = await page.textContent(selector);

    return c.json({
      ok: true,
      type,
      selector,
      text: extractedText,
    });
  }

  return c.json({ ok: false, error: "unknown action type" }, 400);
});

export default {
  port: 6667,
  fetch: app.fetch,
};
