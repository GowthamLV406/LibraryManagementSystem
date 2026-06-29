export class SignUpPage {
  constructor(page) {
    this.page = page;
    this.fullNameInput = page.locator('#fullName');
    this.emailInput = page.locator('#email');
    this.passwordInput = page.locator('#password');
    this.confirmPasswordInput = page.locator('#confirmPassword');
    this.submitButton = page.locator('button[type="submit"]');
    this.apiError = page.locator('.api-error');
    this.signInLink = page.locator('.auth-footer a[href="/signin"]');
    this.passwordStrength = page.locator('.strength-label');
  }

  async goto() {
    await this.page.goto('/signup');
  }

  async register(fullName, email, password, confirmPassword) {
    await this.fullNameInput.fill(fullName);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.confirmPasswordInput.fill(confirmPassword || password);
    await this.submitButton.click();
  }

  async getApiError() {
    return this.apiError.textContent();
  }
}
