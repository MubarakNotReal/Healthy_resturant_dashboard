import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();

page.on('console', (msg) => {
  console.log('BROWSER CONSOLE:', msg.type(), msg.text());
});

page.on('pageerror', (error) => {
  console.log('PAGE ERROR:', error.message);
});

await page.goto('http://localhost:8080', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(2000);
await browser.close();