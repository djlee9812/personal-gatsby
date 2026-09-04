import { expect, test, type Page } from "@playwright/test";

/**
 * Production `gatsby serve` names async chunks `[id]-[contenthash].js`.
 * Develop names them from the file path (`src_components_hero-scene_tsx.js`).
 * `webpackChunkName` is not applied in this Gatsby webpack pipeline, so URL
 * substring matching is not reliable on CI. Abort by a minification-stable
 * string that lives only in the lazy module.
 */
const HERO_CHUNK_MARKER = "#c8cfd0";
const TRAVEL_MAP_CHUNK_MARKER = "travel-map-show-flights";

/** Page/runtime bundles — skip body inspection (large, not the islands). */
function isInitialBundle(url: string): boolean {
  return /\/(app-|commons-|framework-|webpack-runtime|component---)[^/?]*\.js/.test(
    url,
  );
}

async function abortScriptsContaining(page: Page, marker: string): Promise<void> {
  await page.route("**/*.js*", async (route) => {
    const request = route.request();
    if (request.resourceType() !== "script" || isInitialBundle(request.url())) {
      return route.continue();
    }
    const response = await route.fetch();
    const body = await response.text();
    if (body.includes(marker)) {
      return route.abort("failed");
    }
    return route.fulfill({ response, body });
  });
}

async function expectHomepageChromeIntact(page: Page): Promise<void> {
  await expect(
    page.getByRole("heading", { level: 1, name: /DONGJOON/i }),
  ).toBeVisible();
  await expect(page.locator("#about")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /Something went wrong/i }),
  ).toHaveCount(0);
}

test.describe("lazy island failures", () => {
  test("failed HeroScene chunk keeps homepage main content", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await abortScriptsContaining(page, HERO_CHUNK_MARKER);
    await page.goto("/");

    await expectHomepageChromeIntact(page);
    await expect(page.locator("#main")).toBeVisible();
    await expect(page.locator("#travel-map")).toBeVisible();
    await expect(page.locator('[class*="heroSceneFailed"]')).toBeAttached({
      timeout: 15_000,
    });
    await expect(page.locator('[class*="hero3dWrapper"] svg')).toBeVisible();
  });

  test("failed travel-map chunk keeps homepage main content", async ({
    page,
  }) => {
    await abortScriptsContaining(page, TRAVEL_MAP_CHUNK_MARKER);
    await page.goto("/");
    await expect(
      page.getByRole("heading", { level: 1, name: /DONGJOON/i }),
    ).toBeVisible();

    const travelSection = page.locator("#travel-map");
    await travelSection.scrollIntoViewIfNeeded();

    await expectHomepageChromeIntact(page);
    await expect(
      travelSection.getByText(/geography could not be loaded/i),
    ).toBeVisible({ timeout: 15_000 });
  });
});
