import { expect, test } from "@playwright/test";

const ROUTES = ["/", "/gallery", "/projects", "/blog"] as const;

test.describe("smoke", () => {
  for (const path of ROUTES) {
    test(`${path} loads with nav and no horizontal overflow`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.ok()).toBeTruthy();

      const nav = page.getByRole("navigation");
      await expect(nav).toBeVisible();
      await expect(nav.getByRole("link", { name: "Home", exact: true })).toBeVisible();
      await expect(nav.getByRole("link", { name: "Gallery", exact: true })).toBeVisible();
      await expect(nav.getByRole("link", { name: "Projects", exact: true })).toBeVisible();
      await expect(nav.getByRole("link", { name: "Blog", exact: true })).toBeVisible();

      const overflow = await page.evaluate(() => {
        const doc = document.documentElement;
        return doc.scrollWidth > doc.clientWidth + 1;
      });
      expect(overflow).toBe(false);
    });
  }

  test("sample blog post renders", async ({ page }) => {
    const response = await page.goto("/blog/first-post");
    expect(response?.ok()).toBeTruthy();

    await expect(page.getByRole("heading", { name: "First Post" })).toBeVisible();
    await expect(page.getByRole("link", { name: /back to blog/i })).toBeVisible();
  });

  test("blog index lists posts", async ({ page }) => {
    await page.goto("/blog");
    await expect(page.getByRole("heading", { name: "Blog" })).toBeVisible();
    await expect(page.getByRole("link", { name: /first post/i })).toBeVisible();
  });
});
