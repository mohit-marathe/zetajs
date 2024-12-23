// Test the 'convertpdf' example

const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('http://127.0.0.1:3000');

    // Wait for zetaoffice to load
    await page.evaluate("Module.uno_main");

    // Convert test/test.odt to pdf and make sure it opens in new tab
    const download = await page.$("#download");
    download.click();
    const input = await page.$('#input');
    await input.uploadFile('test/test.odt');
    const newTarget = await browser.waitForTarget(target => target.opener() === page.target());
    await newTarget.page();

    await browser.close();
})();
