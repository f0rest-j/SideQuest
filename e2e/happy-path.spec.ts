import { expect, test } from "@playwright/test";

test("onboard, accept, complete, check hero, and survive a reload", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(err.message));

  // 1. Clean storage.
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();

  // 2. Onboarding.
  const name = page.getByLabel("What should we call you?");
  await name.fill("Robin");
  await page.getByRole("button", { name: "Begin adventure" }).click();
  await expect(page.getByRole("heading", { name: "Hey, Robin." })).toBeVisible();
  await expect(page.getByRole("button", { name: /^Accept quest/ })).toHaveCount(3);
  await expect(page.getByRole("progressbar", { name: /Level 1 progress: 0 of/ })).toBeVisible();

  // 3. Accept the first quest.
  const firstCard = page.getByRole("article").first();
  const title = (await firstCard.getByRole("heading").textContent())!.trim();
  const xpText = (await firstCard.getByText(/^\d[\d,]* XP$/).textContent())!.trim();
  const xp = Number(xpText.replace(/[^\d]/g, ""));
  await firstCard.getByRole("button", { name: /^Accept quest/ }).click();
  const active = page.getByRole("region", { name: title });
  await expect(active).toBeVisible();

  // 4. Complete it.
  await active.getByRole("button", { name: "Complete quest" }).click();
  await page.getByRole("button", { name: "Yes, claim XP" }).click();
  const celebration = page.getByRole("dialog", { name: "Quest complete" });
  await expect(celebration).toBeVisible();
  await expect(celebration.getByText(`You earned ${xp} XP.`)).toBeAttached();
  await celebration.getByRole("button", { name: "Continue" }).click();
  await expect(celebration).toBeHidden();

  // 5. XP increased on the board.
  await expect(page.getByRole("progressbar").first()).not.toHaveAccessibleName(/Level 1 progress: 0 of/);

  // 6. Hero screen.
  await page.getByRole("navigation", { name: "Main" }).getByRole("button", { name: "Hero" }).click();
  await expect(page.getByText("Robin", { exact: true })).toBeVisible();
  const recent = page.getByRole("region", { name: "Recent quests" });
  await expect(recent.getByText(title)).toBeVisible();
  await expect(page.getByText(xp.toLocaleString("en"), { exact: true })).toBeVisible();

  // No horizontal overflow at this viewport.
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);

  // 7. Reload: progress remains.
  await page.reload();
  await expect(page.getByRole("heading", { name: "Hey, Robin." })).toBeVisible();
  await page.getByRole("navigation", { name: "Main" }).getByRole("button", { name: "Hero" }).click();
  await expect(page.getByRole("region", { name: "Recent quests" }).getByText(title)).toBeVisible();
  await page.getByRole("navigation", { name: "Main" }).getByRole("button", { name: "Achievements" }).click();
  await expect(page.getByText("1 of 10 unlocked")).toBeVisible();

  expect(errors).toEqual([]);
});

test("malformed storage does not crash the app", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.setItem("sidequest:v1", "{not json"));
  await page.reload();
  await expect(page.getByText(/couldn't be read/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Begin adventure" })).toBeVisible();
});
