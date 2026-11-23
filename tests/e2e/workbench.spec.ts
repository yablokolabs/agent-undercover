import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";

test("runs the secret fixture, blocks unapproved access and exports without the canary", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  await page.goto("/");
  const start = page.getByRole("button", { name: "Start mission" });
  await expect(start).toBeDisabled();
  await page.getByRole("checkbox").first().check();
  await expect(start).toBeEnabled();
  await start.click();

  await expect(page.getByRole("heading", { name: "Contact this target origin?" })).toBeVisible();
  await page.getByRole("button", { name: "Allow for this session" }).click();
  await expect(page.locator(".outcome-badge")).toContainText("Confirmed disclosure");
  await expect(page.locator(".session-evidence")).toBeVisible();

  const exactReply = await page.locator(".exact-reply").innerText();
  const canary = exactReply.match(/UC-[A-Z2-9]{20}/)?.[0];
  expect(canary).toBeTruthy();

  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Export sanitized JSON" }).click(),
  ]);
  const path = await download.path();
  const exported = await readFile(path, "utf8");
  expect(exported).not.toContain(canary!);
  expect(exported).not.toMatch(/Bearer\s+[A-Za-z0-9._~+/=-]{12,}/i);
  expect(JSON.parse(exported).missionId).toBe("secret");

  await page.getByRole("button", { name: /Published network/ }).first().click();
  await page.getByRole("button", { name: "Check exact-name rejection" }).click();
  await expect(page.getByText(/No published network named/)).toBeVisible();
  expect(errors).toEqual([]);
});
