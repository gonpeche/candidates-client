import { expect, test } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

// Lela Dunn — id: 5a27ac3868adf47eb31fe99e, starts as approved
const CANDIDATE_ID = "5a27ac3868adf47eb31fe99e";
const CANDIDATE_NAME = "Lela Dunn";
const CUSTOM_REASON = "Test custom reason E2E";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REASONS_FILE = path.join(__dirname, "../../server/src/data/rejection-reasons.json");
const ORIGINAL_REASONS: string[] = JSON.parse(fs.readFileSync(REASONS_FILE, "utf-8"));

test.beforeEach(async ({ request }) => {
  await request.patch(`http://localhost:3001/candidates/${CANDIDATE_ID}`, {
    data: { reasons: [] },
  });
  // Restore the original rejection reasons list
  fs.writeFileSync(REASONS_FILE, JSON.stringify(ORIGINAL_REASONS, null, 2));
});

test.afterEach(async ({ request }) => {
  await request.patch(`http://localhost:3001/candidates/${CANDIDATE_ID}`, {
    data: { reasons: [] },
  });
  fs.writeFileSync(REASONS_FILE, JSON.stringify(ORIGINAL_REASONS, null, 2));
});

test("reject a candidate with a custom reason", async ({ page }) => {
  await page.goto("/");

  await page.getByLabel("Search candidates by name or email").fill(CANDIDATE_NAME);
  await expect(page.getByText(CANDIDATE_NAME)).toBeVisible();

  await page
    .getByRole("button", { name: new RegExp(`Actions for ${CANDIDATE_NAME}`, "i") })
    .click();

  await page.getByRole("menuitem", { name: /reject candidate/i }).click();

  // Wait for reasons to load
  await expect(page.getByRole("button", { name: /add custom reason/i })).toBeVisible();

  // Open the custom reason input
  await page.getByRole("button", { name: /add custom reason/i }).click();

  // Type the custom reason
  await page.getByPlaceholder(/type a reason/i).fill(CUSTOM_REASON);

  // Add it
  await page.getByRole("button", { name: /^add$/i }).click();

  // The custom reason should appear pre-checked
  await expect(page.getByText(CUSTOM_REASON)).toBeVisible();

  // Confirm from the visible reject dialog instance.
  const rejectDialog = page.getByRole("dialog", { name: /reject candidate/i });
  await expect(rejectDialog).toBeVisible();
  const confirmButton = rejectDialog.locator('button:has-text("Confirm"):visible');
  await expect(confirmButton).toBeEnabled();
  await confirmButton.click();

  // The candidate's status should change to Rejected
  const candidateRow = page.getByRole("row").filter({ hasText: CANDIDATE_NAME });
  await expect(candidateRow.getByText("Rejected", { exact: true })).toBeVisible();

  // The custom reason should be shown in the rejected-status tooltip.
  await candidateRow.locator('[aria-describedby^="rejection-reasons-"]').hover();
  await expect(
    page
      .locator('[data-slot="tooltip-content"]')
      .filter({ hasText: CUSTOM_REASON })
  ).toBeVisible();
});

test("custom reason Add button is disabled for duplicates", async ({ page }) => {
  await page.goto("/");

  await page.getByLabel("Search candidates by name or email").fill(CANDIDATE_NAME);
  await expect(page.getByText(CANDIDATE_NAME)).toBeVisible();

  await page
    .getByRole("button", { name: new RegExp(`Actions for ${CANDIDATE_NAME}`, "i") })
    .click();
  await page.getByText("Reject Candidate").click();

  await expect(page.getByRole("button", { name: /add custom reason/i })).toBeVisible();
  await page.getByRole("button", { name: /add custom reason/i }).click();

  // Type an existing reason
  await page.getByPlaceholder(/type a reason/i).fill("Edad fuera de rango");

  await expect(page.getByRole("button", { name: /^add$/i })).toBeDisabled();
});
