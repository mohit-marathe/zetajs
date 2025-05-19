describe("convert", () => {
  beforeAll(async () => {
    // Wait a bit to give time for the server to start
    await new Promise(r => setTimeout(r, 10000));
    await page.goto("http://127.0.0.1:3000");
  }, 30000);

  it('should convert an odt file to pdf', async () => {
    // Wait for zetaoffice to load
    await new Promise(r => {
      const waitFunc = async () => {
        const success = await page.evaluate(() => {
          return document.querySelector('input').disabled === false;
        });
        success ? r() : setTimeout(waitFunc, 1000);
      };
      waitFunc();
    });

    // Convert test/test.odt to pdf and make sure it opens in new tab
    const download = await page.$("#download");
    download.click();
    const input = await page.$('#input');
    await input.uploadFile('test/e2e/test.odt');
    const newTarget = await browser.waitForTarget(target => target.opener() === page.target());
    await newTarget.page();
  }, 30000);
});
