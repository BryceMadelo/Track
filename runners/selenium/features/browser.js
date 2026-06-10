require('dotenv').config();
const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');
const path = require('path');

let driver;

const getBrowser = () => process.env.SELENIUM_BROWSER || 'chrome';

async function buildDriver() {
  const browser = getBrowser();
  
  if (browser === 'chrome') {
    const options = new chrome.Options();
    options.addArguments('--ignore-certificate-errors');
    options.addArguments('--ignore-ssl-errors');
    options.addArguments('--allow-insecure-localhost');
    
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();
  } else if (browser === 'firefox') {
    driver = await new Builder()
      .forBrowser('firefox')
      .build();
  }

  await driver.manage().window().maximize();
  return driver;
}

async function getDriver() {
  if (!driver) await buildDriver();
  return driver;
}

async function quitDriver() {
  if (driver) {
    await driver.quit();
    driver = null;
  }
}

async function takeScreenshot(stepName) {
  if (!driver) return null;
  try {
    const screenshot = await driver.takeScreenshot();
    const screenshotsDir = path.join(__dirname, '..', 'screenshots');
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
    const timestamp = Date.now();
    const safeName = stepName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filename = `${timestamp}_${safeName}.png`;
    const filepath = path.join(screenshotsDir, filename);
    fs.writeFileSync(filepath, screenshot, 'base64');
    console.log(`📸 Screenshot saved: ${filename}`);
    return filename;
  } catch (err) {
    console.error('Screenshot failed:', err.message);
    return null;
  }
}

module.exports = { getDriver, quitDriver, takeScreenshot, By, until };