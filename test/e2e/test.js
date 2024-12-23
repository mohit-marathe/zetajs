describe("convert", () => {
  beforeAll(async () => {
    await page.goto("http://127.0.0.1:3000");
  });

  it('should convert an odt file to pdf', async () => {
    // Wait for zetaoffice to load
    await page.evaluate("Module.uno_main");

    // Convert test/test.odt to pdf and make sure it opens in new tab
    const download = await page.$("#download");
    download.click();
    const input = await page.$('#input');
    await input.uploadFile('test/e2e/test.odt');
    const newTarget = await browser.waitForTarget(target => target.opener() === page.target());
    await newTarget.page();
  }, 30000);
});
