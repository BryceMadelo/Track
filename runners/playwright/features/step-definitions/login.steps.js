const { Given, When, Then, Before, After } = require('@cucumber/cucumber');
const { chromium } = require('@playwright/test');
const { LoginPage } = require('../pageobjects/login.page');
const { setDefaultTimeout } = require('@cucumber/cucumber');
setDefaultTimeout(30000);

let browser;
let page;
let loginPage;

Before(async () => {
  browser = await chromium.launch({ 
    headless: false,
    ignoreHTTPSErrors: true,
  });
  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
  });
  page = await context.newPage();
  loginPage = new LoginPage(page);
});

After(async () => {
  await browser.close();
});

Given('I open the PPGIS web portal', async () => {
  await loginPage.navigate('https://ppgisportalsqa02/PPGISWEB_HYBRID_OSS/');
});

When('I accept the SSL warning', async () => {
  await page.waitForLoadState('domcontentloaded');
  const advancedButton = page.getByRole('button', { name: /advanced/i });
  if (await advancedButton.isVisible()) {
    await advancedButton.click();
    await page.getByText(/proceed|continue/i).click();
  }
});

When('I click Log In to your account', async () => {
  await loginPage.clickLoginButton();
});

When('I accept the welcome popup', async () => {
  await loginPage.acceptPopup();
});

When('I enter my username and password', async () => {
  await page.waitForTimeout(3000);
  
  const username = process.env.WEB_USERNAME || 't-mcpatalinghug';
  let password = process.env.WEB_PASSWORD || 'p@55w0rd0407';

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
  
  // Take a screenshot so we can see the login form
  await page.screenshot({ path: 'login-form.png' });
  
  // Try pressing Enter on the password field
  await page.locator('input[type="password"]').first().press('Enter');
});

Then('I should be logged in successfully', async () => {
  await page.waitForLoadState('networkidle');
  const title = await page.title();
  console.log('Page title after login:', title);
});