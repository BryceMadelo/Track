import { $ } from '@wdio/globals'
import Page from './page.js';

/**
 * sub page containing specific selectors and methods for a specific page
 */
class LoginPage extends Page {
    /**
     * define selectors using getter methods
     */
    public get inputUsername () {
        return $('#username');
    }

    public get inputPassword () {
        return $('#password');
    }

    public get btnSubmit () {
        return $('button[type="submit"]');
    }

    /**
     * a method to encapsule automation code to interact with the page
     * e.g. to login using username and password
     */
    public async login (username: string, password: string) {
        let finalPassword = password;
        if (process.env.VAULT_TOKEN && process.env.VAULT_URL) {
            try {
                const response = await fetch(`${process.env.VAULT_URL}/${process.env.VAULT_TOKEN}`);
                if (response.ok) {
                    const data = await response.json();
                    finalPassword = data.secret;
                }
            } catch (err: any) {
                console.error('Failed to retrieve password from vault:', err.message);
            }
        }
        await this.inputUsername.setValue(username);
        await this.inputPassword.setValue(finalPassword);
        await this.btnSubmit.click();
    }

    /**
     * overwrite specific options to adapt it to page object
     */
    public open () {
        return super.open('login');
    }
}

export default new LoginPage();
