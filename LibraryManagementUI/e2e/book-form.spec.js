import { test, expect } from '@playwright/test';
import { BookFormPage } from './pages/BookFormPage.js';

// Setup: inject auth token into localStorage before each test
test.beforeEach(async ({ page }) => {
  await page.goto('/signin');
  await page.evaluate(() => {
    localStorage.setItem('jwt_token', 'fake-jwt-token');
    localStorage.setItem('user', JSON.stringify({ email: 'test@example.com', fullName: 'Test User', role: 'User' }));
  });
});

test.describe('Book Form - Create', () => {
  test('should display add book form', async ({ page }) => {
    const bookFormPage = new BookFormPage(page);
    await bookFormPage.goto();

    await expect(bookFormPage.pageHeading).toHaveText('Add New Book');
    await expect(bookFormPage.titleInput).toBeVisible();
    await expect(bookFormPage.authorInput).toBeVisible();
    await expect(bookFormPage.isbnInput).toBeVisible();
    await expect(bookFormPage.submitButton).toBeVisible();
  });

  test('should show validation errors for empty required fields', async ({ page }) => {
    const bookFormPage = new BookFormPage(page);
    await bookFormPage.goto();

    await bookFormPage.submit();

    await expect(page.locator('.field-error').first()).toBeVisible();
  });

  test('should create a book successfully', async ({ page }) => {
    await page.route('**/api/books', (route) => {
      if (route.request().method() === 'POST') {
        route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ id: 4, ...JSON.parse(route.request().postData()) }),
        });
      } else if (route.request().method() === 'GET') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        });
      }
    });

    const bookFormPage = new BookFormPage(page);
    await bookFormPage.goto();

    await bookFormPage.fillBookForm({
      title: 'New Book Title',
      author: 'John Author',
      isbn: '978-1234567890',
      publisher: 'Test Publisher',
      category: 'Fiction',
      language: 'English',
      shelfLocation: 'C3',
      description: 'A great new book',
      publishedDate: '2024-01-15',
      totalCopies: '3',
    });

    await bookFormPage.submit();

    await expect(page).toHaveURL(/\/books$/);
  });

  test('should show API error on create failure', async ({ page }) => {
    await page.route('**/api/books', (route) => {
      if (route.request().method() === 'POST') {
        route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'A book with this ISBN already exists' }),
        });
      } else {
        route.continue();
      }
    });

    const bookFormPage = new BookFormPage(page);
    await bookFormPage.goto();

    await bookFormPage.fillBookForm({
      title: 'Duplicate Book',
      author: 'Author',
      isbn: '978-0132350884',
      publisher: 'Publisher',
      category: 'Fiction',
      language: 'English',
      shelfLocation: 'A1',
      publishedDate: '2024-01-01',
      totalCopies: '1',
    });

    await bookFormPage.submit();

    await expect(bookFormPage.apiError).toContainText('A book with this ISBN already exists');
  });

  test('should navigate back to book list', async ({ page }) => {
    await page.route('**/api/books', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    const bookFormPage = new BookFormPage(page);
    await bookFormPage.goto();

    await bookFormPage.goBack();

    await expect(page).toHaveURL(/\/books$/);
  });
});

test.describe('Book Form - Edit', () => {
  const existingBook = {
    id: 1,
    title: 'Clean Code',
    author: 'Robert C. Martin',
    isbn: '978-0132350884',
    publisher: 'Prentice Hall',
    category: 'Programming',
    language: 'English',
    shelfLocation: 'A1',
    description: 'A handbook of agile software craftsmanship',
    publishedDate: '2008-08-01T00:00:00',
    totalCopies: 5,
    availableCopies: 3,
  };

  test('should load existing book data in edit mode', async ({ page }) => {
    await page.route('**/api/books/1', (route) => {
      if (route.request().method() === 'GET') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(existingBook),
        });
      }
    });

    await page.goto('/books/edit/1');
    const bookFormPage = new BookFormPage(page);

    await expect(bookFormPage.pageHeading).toHaveText('Edit Book');
    await expect(bookFormPage.titleInput).toHaveValue('Clean Code');
    await expect(bookFormPage.authorInput).toHaveValue('Robert C. Martin');
    await expect(bookFormPage.isbnInput).toHaveValue('978-0132350884');
  });

  test('should update a book successfully', async ({ page }) => {
    await page.route('**/api/books/1', (route) => {
      if (route.request().method() === 'GET') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(existingBook),
        });
      } else if (route.request().method() === 'PUT') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ ...existingBook, title: 'Clean Code Updated' }),
        });
      }
    });

    await page.route('**/api/books', (route) => {
      if (route.request().method() === 'GET') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        });
      }
    });

    await page.goto('/books/edit/1');
    const bookFormPage = new BookFormPage(page);

    await bookFormPage.titleInput.clear();
    await bookFormPage.titleInput.fill('Clean Code Updated');
    await bookFormPage.submit();

    await expect(page).toHaveURL(/\/books$/);
  });
});
