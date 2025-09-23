import { test, expect } from "@playwright/test";

test.describe("Invoice print isolation", () => {
  test("print view hides app shell and shows only invoice", async ({ page }) => {
    // Navigate to a test invoice print page
    // You may need to adjust this URL based on your test data
    const invoiceId = "68ceb78cc10058fdd2d354f6"; // Use a known test invoice ID
    await page.goto(`/dashboard/sales/invoices/${invoiceId}/print`, { waitUntil: "networkidle" });

    // Emulate print media to apply @media print rules
    await page.emulateMedia({ media: "print" });

    // 1) App shell hidden - check for dashboard layout elements
    const headerVisible = await page.evaluate(() => {
      const selectors = [
        "header", 
        ".app-header", 
        "nav", 
        "aside", 
        ".app-sidebar", 
        ".left-rail",
        ".flex.flex-col.h-screen", // Dashboard layout wrapper
        ".main-content-scrollbar" // Main content area
      ];
      
      for (const selector of selectors) {
        const el = document.querySelector(selector);
        if (el) {
          const style = window.getComputedStyle(el);
          if (style.display !== "none" && style.visibility !== "hidden") {
            return true;
          }
        }
      }
      return false;
    });
    expect(headerVisible).toBeFalsy();

    // 2) Only .invoice-container visible
    const visibleOutsideInvoice = await page.evaluate(() => {
      const invoice = document.querySelector(".invoice-container");
      if (!invoice) return true; // If no invoice container, test fails
      
      const everything = Array.from(document.body.querySelectorAll("*"));
      return everything.some((el) => {
        if (invoice.contains(el) || el === invoice) return false;
        const cs = getComputedStyle(el);
        return cs.visibility !== "hidden" && cs.display !== "none";
      });
    });
    expect(visibleOutsideInvoice).toBeFalsy();

    // 3) No transforms on invoice
    const hasTransform = await page.evaluate(() => {
      const el = document.querySelector(".invoice-container") as HTMLElement | null;
      if (!el) return true;
      const t = getComputedStyle(el).transform;
      return t && t !== "none";
    });
    expect(hasTransform).toBeFalsy();

    // 4) Width close to 190mm (@ 96dpi ~ 718px)
    const widthPx = await page.evaluate(() => {
      const el = document.querySelector(".invoice-container") as HTMLElement | null;
      return el ? el.getBoundingClientRect().width : 0;
    });
    expect(widthPx).toBeGreaterThan(680); // tolerance
    expect(widthPx).toBeLessThan(760);

    // 5) Table rows not split (no element with forced page-break inside)
    const anyRowBroken = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll(".invoice-container table tr"));
      return rows.some((tr) => {
        const cs = getComputedStyle(tr);
        return cs.breakInside === "auto" && cs.pageBreakInside !== "avoid"; // heuristic
      });
    });
    expect(anyRowBroken).toBeFalsy();

    // 6) Print controls are hidden in print media
    const printControlsVisible = await page.evaluate(() => {
      const controls = document.querySelector(".print-controls, .no-print, [data-print-control='true']");
      if (!controls) return false;
      const style = window.getComputedStyle(controls);
      return style.display !== "none";
    });
    expect(printControlsVisible).toBeFalsy();

    // 7) Invoice content is properly structured
    const invoiceStructure = await page.evaluate(() => {
      const container = document.querySelector(".invoice-container");
      if (!container) return false;
      
      // Check for key invoice elements
      const hasCompanyName = container.querySelector("h1")?.textContent?.includes("ROBOBOOKS");
      const hasTable = container.querySelector("table");
      const hasFinancialSummary = container.querySelector("table")?.textContent?.includes("FINANCIAL SUMMARY");
      
      return !!(hasCompanyName && hasTable && hasFinancialSummary);
    });
    expect(invoiceStructure).toBeTruthy();
  });

  test("print preview matches screen preview design", async ({ page }) => {
    const invoiceId = "68ceb78cc10058fdd2d354f6";
    
    // First, get the screen preview
    await page.goto(`/dashboard/sales/invoices/${invoiceId}`, { waitUntil: "networkidle" });
    const screenPreview = await page.screenshot({ 
      fullPage: true,
      clip: { x: 0, y: 0, width: 1200, height: 800 } // Focus on invoice area
    });

    // Then get the print preview
    await page.goto(`/dashboard/sales/invoices/${invoiceId}/print`, { waitUntil: "networkidle" });
    await page.emulateMedia({ media: "print" });
    const printPreview = await page.screenshot({ 
      fullPage: true,
      clip: { x: 0, y: 0, width: 1200, height: 800 } // Same area
    });

    // Compare the screenshots (they should be very similar)
    expect(screenPreview).toEqual(printPreview);
  });
});
