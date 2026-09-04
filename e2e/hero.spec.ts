import { expect, test } from "@playwright/test";

const heroSvg = '[class*="hero3dWrapper"] svg';
const heroCanvas = '[class*="hero3dWrapper"] canvas';

test.describe("homepage hero visual", () => {
  test("desktop reduced-motion keeps the SVG plane", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    await expect(
      page.getByRole("heading", { level: 1, name: /DONGJOON/i }),
    ).toBeVisible();
    await expect(page.locator(heroSvg)).toBeVisible();
    await expect(page.locator(heroCanvas)).toHaveCount(0);
  });

  test("desktop motion keeps the SVG hidden while the 3D scene can load", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");

    await expect(
      page.getByRole("heading", { level: 1, name: /DONGJOON/i }),
    ).toBeVisible();
    await expect(page.locator(heroSvg)).toBeHidden();
  });
});
