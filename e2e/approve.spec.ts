import { expect, test } from "@playwright/test";

// Aiden Armstrong — id: 5a271a1368adf47eb31fe683, starts as rejected
const CANDIDATE_ID = "5a271a1368adf47eb31fe683";
const CANDIDATE_NAME = "Aiden Armstrong";

test.beforeEach(async ({ request }) => {
  // Reset: ensure the candidate is rejected before each run
  await request.patch(`http://localhost:3001/candidates/${CANDIDATE_ID}`, {
    data: { reasons: ["Edad fuera de rango"] },
  });
});

test("approve a rejected candidate", async ({ page }) => {
  await page.goto("/");

  // Search for the candidate to isolate the row
  await page.getByLabel("Search candidates by name or email").fill(CANDIDATE_NAME);
  await expect(page.getByText(CANDIDATE_NAME)).toBeVisible();

  // Open the action menu
  await page
    .getByRole("button", { name: new RegExp(`Actions for ${CANDIDATE_NAME}`, "i") })
    .click();

  // Click "Approve Candidate" in the dropdown
  await page.getByText("Approve Candidate").click();

  // Confirm in the AlertDialog
  await page.getByRole("button", { name: /confirm/i }).click();

  // The status badge should now show "Approved" — scope to the candidate's row
  // to avoid strict-mode violation from other "Approved" badges in the table
  await expect(
    page.getByRole("row").filter({ hasText: CANDIDATE_NAME }).getByText("Approved", { exact: true })
  ).toBeVisible();

  // A success toast should appear
  await expect(
    page.getByText(`${CANDIDATE_NAME} has been approved.`)
  ).toBeVisible();
});
