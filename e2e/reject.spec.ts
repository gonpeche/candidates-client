import { expect, test } from "@playwright/test";

// Marcus Patrick — id: 59fd1f8a68adf47eb31f5604, starts as approved
const CANDIDATE_ID = "59fd1f8a68adf47eb31f5604";
const CANDIDATE_NAME = "Marcus Patrick";
const SELECTED_REASON = "Edad fuera de rango";

test.beforeEach(async ({ request }) => {
  // Reset: ensure the candidate is approved before each run
  await request.patch(`http://localhost:3001/candidates/${CANDIDATE_ID}`, {
    data: { reasons: [] },
  });
});

test("reject an approved candidate", async ({ page }) => {
  await page.goto("/");

  // Search for the candidate to isolate the row
  await page.getByLabel("Search candidates by name or email").fill(CANDIDATE_NAME);
  await expect(page.getByText(CANDIDATE_NAME)).toBeVisible();

  // Open the action menu
  await page
    .getByRole("button", { name: new RegExp(`Actions for ${CANDIDATE_NAME}`, "i") })
    .click();

  // Click "Reject Candidate" in the dropdown
  await page.getByRole("menuitem", { name: /reject candidate/i }).click();

  // Select a rejection reason — wait for the label (reasons are fetched async),
  // then click the <label> directly instead of the Base UI hidden input
  const reasonLabel = page.locator("label").filter({ hasText: SELECTED_REASON });
  await expect(reasonLabel).toBeVisible();
  await reasonLabel.click();

  // Confirm from the visible reject dialog instance.
  const rejectDialog = page.getByRole("dialog", { name: /reject candidate/i });
  await expect(rejectDialog).toBeVisible();
  const confirmButton = rejectDialog.locator('button:has-text("Confirm"):visible');
  await expect(confirmButton).toBeEnabled();
  await confirmButton.click();

  // The status badge should now show "Rejected" — scope to the candidate's row
  const candidateRow = page.getByRole("row").filter({ hasText: CANDIDATE_NAME });
  await expect(candidateRow.getByText("Rejected", { exact: true })).toBeVisible();

  // Hover over the Rejected badge trigger to verify tooltip shows the reason — scope to row
  await candidateRow.locator('[aria-describedby^="rejection-reasons-"]').hover();
  await expect(
    page
      .locator('[data-slot="tooltip-content"]')
      .filter({ hasText: SELECTED_REASON })
  ).toBeVisible();
});
