export class SignInPage {
  constructor(page) {
    this.page = page;
    this.emailInput = page.locator('#email');
    this.passwordInput = page.locator('#password');
    this.submitButton = page.locator('button[type="submit"]');
    this.apiError = page.locator('.api-error');
    this.emailError = page.locator('.form-group:has(#email) .error-text');
    this.passwordError = page.locator('.form-group:has(#password) .error-text');
    this.signUpLink = page.locator('.auth-footer a[href="/signup"]');
    this.togglePasswordButton = page.locator('.toggle-password');
  }

  async goto() {
    await this.page.goto('/signin');
  }

  async login(email, password) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async getApiError() {
    return this.apiError.textContent();
  }
}
