const { chromium } = require('@playwright/test');

class LoginPage {
  constructor(page) {
    this.page = page;
  }

  async navigate(url) {
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
  }

  async clickLoginButton() {
    await this.page.getByText('Log In to your account').click();
  }

  async acceptPopup() {
    await this.page.waitForSelector('button:has-text("OK"), input[value="OK"]', { timeout: 5000 });
    await this.page.getByRole('button', { name: 'OK' }).click();
  }

  async login(username, password) {
    await this.page.getByLabel('Username').fill(username);
    await this.page.getByLabel('Password').fill(password);
    await this.page.getByRole('button', { name: /login|sign in|submit/i }).click();
  }
}

module.exports = { LoginPage };