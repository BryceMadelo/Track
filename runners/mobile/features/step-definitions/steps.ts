import { Given, Then } from '@wdio/cucumber-framework';

Given('I open the app', async () => {
    await driver.pause(3000);
});

Then('the app should be running', async () => {
    const source = await driver.getPageSource();
    expect(source).toBeTruthy();
    console.log('App launched successfully!');
});