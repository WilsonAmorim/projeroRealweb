try {
  const { chromium } = await import('playwright');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

    const logs = [];
    page.on('console', msg => {
      logs.push({ type: msg.type(), text: msg.text() });
    });
    page.on('pageerror', err => {
      logs.push({ type: 'pageerror', text: err.message, stack: err.stack });
    });

    await page.goto('http://localhost:5174/', { waitUntil: 'networkidle' , timeout: 15000});
    await page.screenshot({ path: 'screenshot_page.png', fullPage: true });
    console.log('Screenshot saved to screenshot_page.png');
    console.log('Console logs:');
    console.log(JSON.stringify(logs, null, 2));
    await browser.close();
} catch (err) {
  console.error('Error running Playwright script:', err);
  process.exit(1);
}
