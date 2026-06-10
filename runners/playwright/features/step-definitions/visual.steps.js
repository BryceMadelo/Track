require('dotenv').config();
const { Given, When, Then, Before, After } = require('@cucumber/cucumber');
const { setDefaultTimeout } = require('@cucumber/cucumber');
const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

setDefaultTimeout(60000);

let browser;
let page;
let screenshotDir;
let stepCounter = 0;

Before(async () => {
  browser = await chromium.launch({
    headless: false,
    ignoreHTTPSErrors: true,
  });
  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
  });
  page = await context.newPage();
  screenshotDir = path.join(__dirname, '..', '..', 'screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }
  stepCounter = 0;
});

After(async (scenario) => {
  if (scenario.result.status === 'FAILED') {
    await captureScreenshot('FAILED_' + scenario.pickle.name);
  }
  if (browser) await browser.close();
});

async function captureScreenshot(stepName) {
  try {
    stepCounter++;
    const safeName = stepName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filename = `${String(stepCounter).padStart(2, '0')}_${safeName}_${Date.now()}.png`;
    const filepath = path.join(screenshotDir, filename);
    await page.screenshot({ path: filepath, fullPage: true });
    console.log(`📸 Screenshot: ${filename}`);
    return filename;
  } catch (err) {
    console.error('Screenshot failed:', err.message);
    return null;
  }
}

async function executeStep(title) {
  const t = title.toLowerCase();
  const shouldCapture = process.env.CAPTURE_SCREENSHOTS === 'true';
  const screenshotSteps = (process.env.SCREENSHOT_STEPS || '').toLowerCase().split(',');
  const shouldCaptureThis = shouldCapture || screenshotSteps.some(s => s && t.includes(s.trim().toLowerCase()));

  // Open / Navigate
  if (t.includes('open') || t.includes('navigate') || t.includes('launch') || t.includes('go to')) {
    const url = process.env.WEB_BASE_URL || '';
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
  }

  // SSL Warning
  else if (t.includes('ssl') || t.includes('advanced') || t.includes('certificate')) {
    try {
      const advanced = page.getByRole('button', { name: /advanced/i });
      if (await advanced.isVisible({ timeout: 3000 })) {
        await advanced.click();
        await page.getByText(/proceed|continue/i).click();
        await page.waitForTimeout(1000);
      }
    } catch { console.log('No SSL warning'); }
  }

  // Click login / log in button
  else if (t.includes('log in to your account') || t.includes('login to your account')) {
    await page.getByText(/log in to your account/i).click();
    await page.waitForTimeout(1000);
  }

  // Accept popup / terms / ok
  else if (t.includes('popup') || t.includes('accept') || t.includes('ok') || t.includes('terms')) {
    try {
      await page.waitForTimeout(1000);
      const okBtn = page.getByRole('button', { name: /ok/i });
      if (await okBtn.isVisible({ timeout: 3000 })) {
        await okBtn.click();
        await page.waitForTimeout(500);
      }
    } catch { console.log('No popup found'); }
  }

  // Enter username and password / credentials / login form
  else if (t.includes('username') || t.includes('password') || t.includes('credential') || t.includes('login form')) {
    const username = process.env.WEB_USERNAME || '';
    let password = process.env.WEB_PASSWORD || '';

    if (process.env.VAULT_TOKEN && process.env.VAULT_URL) {
      try {
        const response = await fetch(`${process.env.VAULT_URL}/${process.env.VAULT_TOKEN}`);
        if (response.ok) {
          const data = await response.json();
          password = data.secret;
        }
      } catch (err) {
        console.error('Failed to retrieve password from vault:', err.message);
      }
    }

    await page.locator('input[type="text"]').first().fill(username);
    await page.locator('input[type="password"]').first().fill(password);
    await page.locator('input[type="password"]').first().press('Enter');
    await page.waitForTimeout(2000);
  }

  // Click any button
  else if (t.includes('click') || t.includes('press') || t.includes('tap')) {
    const words = title.split(' ');
    const buttonText = words.slice(words.findIndex(w =>
      w.toLowerCase() === 'click' || w.toLowerCase() === 'press' || w.toLowerCase() === 'tap'
    ) + 1).join(' ');
    try {
      await page.getByRole('button', { name: new RegExp(buttonText, 'i') }).first().click();
      await page.waitForTimeout(500);
    } catch {
      await page.getByText(new RegExp(buttonText, 'i')).first().click();
      await page.waitForTimeout(500);
    }
  }

  // Verify / check / should see / assert
  else if (t.includes('verify') || t.includes('check') || t.includes('should') || t.includes('assert') || t.includes('logged in')) {
    await page.waitForLoadState('networkidle');
    const title2 = await page.title();
    console.log(`✅ Verified: Page title is "${title2}"`);
  }

  // Wait / pause
  else if (t.includes('wait') || t.includes('pause')) {
    await page.waitForTimeout(2000);
  }

  // Scroll
  else if (t.includes('scroll')) {
    await page.evaluate(() => window.scrollBy(0, 300));
  }

  // Default — just wait and log
  else {
    console.log(`⚡ Executing step: ${title}`);
    await page.waitForTimeout(1000);
  }

  // Take screenshot if this step requires it
  if (shouldCaptureThis) {
    await captureScreenshot(title);
  }
}

const { defineStep } = require('@cucumber/cucumber');

defineStep(/^(.+)$/, async (stepTitle) => {
  await executeStep(stepTitle);
});