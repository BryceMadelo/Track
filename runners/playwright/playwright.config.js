const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  timeout: 30000,
  use: {
    headless: false,
    baseURL: 'https://ppgisportalsqa02/PPGISWEB_HYBRID_OSS/',
    ignoreHTTPSErrors: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
});