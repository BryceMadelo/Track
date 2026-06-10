require('dotenv').config();
const { Given, When, Then, Before, After, AfterStep } = require('@cucumber/cucumber');
const { setDefaultTimeout } = require('@cucumber/cucumber');
const { getDriver, quitDriver, takeScreenshot, By, until } = require('../browser');

setDefaultTimeout(30000);

let driver;
let currentStepName = '';

Before(async () => {
  driver = await getDriver();
});

After(async (scenario) => {
  if (scenario.result.status === 'FAILED') {
    await takeScreenshot('FAILED_' + scenario.pickle.name);
  }
  await quitDriver();
});

AfterStep(async function (step) {
  currentStepName = step.pickleStep.text;
  const shouldCapture = process.env.CAPTURE_SCREENSHOTS === 'true';
  if (shouldCapture) {
    await takeScreenshot(currentStepName);
  }
});

Given('I open the PPGIS web portal', async () => {
  const url = process.env.WEB_BASE_URL || 'https://ppgisportalsqa02/PPGISWEB_HYBRID_OSS/';
  await driver.get(url);
  await driver.sleep(2000);
  await takeScreenshot('01_open_portal');
});

When('I accept the SSL warning', async () => {
  try {
    const advancedBtn = await driver.findElement(By.id('details-button'));
    await advancedBtn.click();
    await driver.sleep(500);
    const proceedLink = await driver.findElement(By.id('proceed-link'));
    await proceedLink.click();
    await driver.sleep(1000);
    await takeScreenshot('02_ssl_accepted');
  } catch {
    console.log('No SSL warning found, continuing...');
  }
});

When('I click Log In to your account', async () => {
  await driver.sleep(1000);
  const loginBtn = await driver.findElement(
    By.xpath("//*[contains(text(), 'Log In to your account')]")
  );
  await loginBtn.click();
  await driver.sleep(1000);
  await takeScreenshot('03_login_clicked');
});

When('I accept the welcome popup', async () => {
  try {
    await driver.sleep(1000);
    const okBtn = await driver.findElement(
      By.xpath("//button[contains(text(), 'OK')] | //input[@value='OK']")
    );
    await okBtn.click();
    await driver.sleep(500);
    await takeScreenshot('04_popup_accepted');
  } catch {
    console.log('No popup found, continuing...');
  }
});

When('I enter my username and password', async () => {
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

  const usernameField = await driver.findElement(By.css('input[type="text"]'));
  await usernameField.clear();
  await usernameField.sendKeys(username);

  const passwordField = await driver.findElement(By.css('input[type="password"]'));
  await passwordField.clear();
  await passwordField.sendKeys(password);

  await takeScreenshot('05_credentials_entered');

  await passwordField.sendKeys('\n');
  await driver.sleep(2000);
});

Then('I should be logged in successfully', async () => {
  await driver.sleep(2000);
  const title = await driver.getTitle();
  console.log('Page title after login:', title);
  await takeScreenshot('06_logged_in');
});