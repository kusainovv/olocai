import { Hono } from "hono";
import { chromium, Browser } from "playwright";

const app = new Hono();

let browser: Browser | null = null;

async function getBrowser() {
  if (!browser) {
    browser = await chromium.launch({
      headless: false,
    });
  }

  return browser;
}

app.get("/", (c) => c.text("API is working"));

app.post("/action", async (c) => {
  try {
    const body = await c.req.json();
    const { type, url } = body as { type: "title"; url: string };

    const browser = await getBrowser();
    const page = await browser.newPage();

    try {
      if (type === "title") {
        await page.goto(url, { waitUntil: "domcontentloaded" });

        return c.json({
          ok: true,
          title: await page.title(),
        });
      }

      return c.json({ ok: false, error: "unknown action type" }, 400);
    } finally {
      await page.close();
    }
  } catch (error) {
    return c.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      },
      500,
    );
  }
});

export default {
  port: 6667,
  fetch: app.fetch,
};
