import { expect, test } from "@playwright/test";

const ORIGINAL_COLUMNS = {
  id: false,
  name: true,
  document: true,
  cv_zonajobs: true,
  cv_bumeran: false,
  phone: false,
  email: true,
  date: true,
  age: false,
  has_university: false,
  career: true,
  graduated: false,
  courses_approved: false,
  location: false,
  accepts_working_hours: false,
  desired_salary: true,
  had_interview: false,
  reason: true,
};

test.beforeEach(async ({ request }) => {
  await request.put("http://localhost:3001/columns", { data: ORIGINAL_COLUMNS });
});

test.afterEach(async ({ request }) => {
  await request.put("http://localhost:3001/columns", { data: ORIGINAL_COLUMNS });
});

test("toggle a column off and confirm — column disappears from the table", async ({ page }) => {
  await page.goto("/");

  // Email column should be visible initially
  await expect(page.getByRole("columnheader", { name: "Email" })).toBeVisible();

  // Open the column visibility dropdown
  await page.getByRole("button", { name: /visible columns/i }).click();

  // Toggle Email off (currently visible)
  await page.getByRole("switch", { name: /toggle email column visibility/i }).click();

  // Confirm
  await page.getByRole("button", { name: /confirm/i }).click();

  // Email column should no longer be visible
  await expect(page.getByRole("columnheader", { name: "Email" })).not.toBeVisible();
});

test("toggle a column on — column appears in the table", async ({ request, page }) => {
  // Start with Phone hidden
  await request.put("http://localhost:3001/columns", {
    data: { ...ORIGINAL_COLUMNS, phone: false },
  });

  await page.goto("/");
  await expect(page.getByRole("columnheader", { name: "Phone" })).not.toBeVisible();

  await page.getByRole("button", { name: /visible columns/i }).click();
  await page.getByRole("switch", { name: /toggle phone column visibility/i }).click();
  await page.getByRole("button", { name: /confirm/i }).click();

  await expect(page.getByRole("columnheader", { name: "Phone" })).toBeVisible();
});
