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

  test("essay post renders article layout", async ({ page }) => {
    const response = await page.goto("/blog/travel-recap-flights-2025");
    expect(response?.ok()).toBeTruthy();

    await expect(
      page.getByRole("heading", { name: /2025 Travel Recap: Flights/i }),
    ).toBeVisible();
    // Guaranteed by blog-post.tsx when frontmatter.layout === "essay"
    // (CSS module local name is embedded in the hashed class).
    await expect(page.locator('article[class*="postContentEssay"]')).toBeVisible();
    await expect(page.getByRole("link", { name: /back to blog/i })).toBeVisible();
  });

  test("homepage travel map section is visible", async ({ page }) => {
    await page.goto("/");
    const travelSection = page.locator("#travel-map");
    await expect(travelSection).toBeVisible();
    await expect(travelSection.getByText(/Travel/i)).toBeVisible();
  });

  test("gallery page has heading", async ({ page }) => {
    await page.goto("/gallery");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("gallery modal", async ({ page }) => {
    await page.goto("/gallery");

    const imageCell = page.getByRole("button").filter({ has: page.locator("img") }).first();
    if ((await imageCell.count()) === 0) {
      test.skip(true, "No gallery images (empty Cloudinary)");
    }

    await imageCell.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });
});
