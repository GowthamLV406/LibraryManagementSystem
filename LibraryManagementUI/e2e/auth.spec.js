import { test, expect } from '@playwright/test';
import { SignInPage } from './pages/SignInPage.js';
import { SignUpPage } from './pages/SignUpPage.js';

test.describe('Authentication', () => {
  test.describe('Sign In Page', () => {
    test('should display sign in form', async ({ page }) => {
      const signInPage = new SignInPage(page);
      await signInPage.goto();

      await expect(page.locator('h2')).toHaveText('Welcome back');
      await expect(signInPage.emailInput).toBeVisible();
      await expect(signInPage.passwordInput).toBeVisible();
      await expect(signInPage.submitButton).toBeVisible();
    });

    test('should show validation errors for empty fields', async ({ page }) => {
      const signInPage = new SignInPage(page);
      await signInPage.goto();

      await signInPage.submitButton.click();

      await expect(signInPage.emailError).toHaveText('Email is required');
      await expect(signInPage.passwordError).toHaveText('Password is required');
    });

    test('should show error for invalid email format', async ({ page }) => {
      const signInPage = new SignInPage(page);
      await signInPage.goto();

      await signInPage.emailInput.fill('invalid-email');
      await signInPage.passwordInput.fill('password123');
      await signInPage.submitButton.click();

      await expect(signInPage.emailError).toHaveText('Enter a valid email');
    });

    test('should toggle password visibility', async ({ page }) => {
      const signInPage = new SignInPage(page);
      await signInPage.goto();

      await signInPage.passwordInput.fill('mypassword');
      await expect(signInPage.passwordInput).toHaveAttribute('type', 'password');

      await signInPage.togglePasswordButton.click();
      await expect(signInPage.passwordInput).toHaveAttribute('type', 'text');

      await signInPage.togglePasswordButton.click();
      await expect(signInPage.passwordInput).toHaveAttribute('type', 'password');
    });

    test('should navigate to sign up page', async ({ page }) => {
      const signInPage = new SignInPage(page);
      await signInPage.goto();

      await signInPage.signUpLink.click();

      await expect(page).toHaveURL(/\/signup/);
    });

    test('should show API error on invalid credentials', async ({ page }) => {
      const signInPage = new SignInPage(page);
      await signInPage.goto();

      // Mock the API to return an error
      await page.route('**/api/auth/login', (route) => {
        route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Invalid email or password' }),
        });
      });

      await signInPage.login('wrong@example.com', 'wrongpassword');

      await expect(signInPage.apiError).toHaveText('Invalid email or password');
    });

    test('should redirect to dashboard on successful login', async ({ page }) => {
      const signInPage = new SignInPage(page);
      await signInPage.goto();

      // Mock the API to return success
      await page.route('**/api/auth/login', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            token: 'fake-jwt-token',
            email: 'test@example.com',
            fullName: 'Test User',
            role: 'User',
          }),
        });
      });

      await signInPage.login('test@example.com', 'Password123!');

      await expect(page).toHaveURL(/\/books/);
    });
  });

  test.describe('Sign Up Page', () => {
    test('should display sign up form', async ({ page }) => {
      const signUpPage = new SignUpPage(page);
      await signUpPage.goto();

      await expect(page.locator('h2')).toHaveText('Create an account');
      await expect(signUpPage.fullNameInput).toBeVisible();
      await expect(signUpPage.emailInput).toBeVisible();
      await expect(signUpPage.passwordInput).toBeVisible();
      await expect(signUpPage.confirmPasswordInput).toBeVisible();
    });

    test('should show validation errors for empty fields', async ({ page }) => {
      const signUpPage = new SignUpPage(page);
      await signUpPage.goto();

      await signUpPage.submitButton.click();

      await expect(page.locator('.error-text').first()).toBeVisible();
    });

    test('should show error for password mismatch', async ({ page }) => {
      const signUpPage = new SignUpPage(page);
      await signUpPage.goto();

      await signUpPage.register('Test User', 'test@example.com', 'Password123!', 'DifferentPass!');

      await expect(page.locator('.error-text', { hasText: 'Passwords do not match' })).toBeVisible();
    });

    test('should show error for short password', async ({ page }) => {
      const signUpPage = new SignUpPage(page);
      await signUpPage.goto();

      await signUpPage.register('Test User', 'test@example.com', 'short', 'short');

      await expect(page.locator('.error-text', { hasText: 'Password must be at least 8 characters' })).toBeVisible();
    });

    test('should navigate to sign in page', async ({ page }) => {
      const signUpPage = new SignUpPage(page);
      await signUpPage.goto();

      await signUpPage.signInLink.click();

      await expect(page).toHaveURL(/\/signin/);
    });

    test('should redirect to dashboard on successful registration', async ({ page }) => {
      const signUpPage = new SignUpPage(page);
      await signUpPage.goto();

      // Mock the API to return success
      await page.route('**/api/auth/register', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            token: 'fake-jwt-token',
            email: 'newuser@example.com',
            fullName: 'New User',
            role: 'User',
          }),
        });
      });

      await signUpPage.register('New User', 'newuser@example.com', 'Password123!', 'Password123!');

      await expect(page).toHaveURL(/\/books/);
    });
  });
});
