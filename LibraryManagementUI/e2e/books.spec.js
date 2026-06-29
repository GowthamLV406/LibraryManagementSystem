import { test, expect } from '@playwright/test';
import { BookListPage } from './pages/BookListPage.js';
import { BookFormPage } from './pages/BookFormPage.js';

const mockBooks = [
  {
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
  },
  {
    id: 2,
    title: 'The Pragmatic Programmer',
    author: 'David Thomas',
    isbn: '978-0135957059',
    publisher: 'Addison-Wesley',
    category: 'Programming',
    language: 'English',
    shelfLocation: 'A2',
    description: 'Your journey to mastery',
    publishedDate: '2019-09-13T00:00:00',
    totalCopies: 3,
    availableCopies: 0,
  },
  {
    id: 3,
    title: 'Design Patterns',
    author: 'Gang of Four',
    isbn: '978-0201633610',
    publisher: 'Addison-Wesley',
    category: 'Software Engineering',
    language: 'English',
    shelfLocation: 'B1',
    description: 'Elements of reusable object-oriented software',
    publishedDate: '1994-10-31T00:00:00',
    totalCopies: 2,
    availableCopies: 2,
  },
];

// Setup: inject auth token into localStorage before each test
test.beforeEach(async ({ page }) => {
  await page.goto('/signin');
  await page.evaluate(() => {
    localStorage.setItem('jwt_token', 'fake-jwt-token');
    localStorage.setItem('user', JSON.stringify({ email: 'test@example.com', fullName: 'Test User', role: 'User' }));
  });
});

test.describe('Book List', () => {
  test('should display list of books', async ({ page }) => {
    await page.route('**/api/books', (route) => {
      if (route.request().method() === 'GET') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockBooks),
        });
      }
    });

    const bookListPage = new BookListPage(page);
    await bookListPage.goto();

    await expect(bookListPage.heading).toBeVisible();
    await expect(bookListPage.bookCards).toHaveCount(3);
  });

  test('should show book details in cards', async ({ page }) => {
    await page.route('**/api/books', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockBooks),
      });
    });

    const bookListPage = new BookListPage(page);
    await bookListPage.goto();

    const firstCard = await bookListPage.getBookCardByTitle('Clean Code');
    await expect(firstCard).toContainText('Robert C. Martin');
    await expect(firstCard).toContainText('Programming');
    await expect(firstCard).toContainText('978-0132350884');
    await expect(firstCard).toContainText('Available');
  });

  test('should show unavailable status when no copies available', async ({ page }) => {
    await page.route('**/api/books', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockBooks),
      });
    });

    const bookListPage = new BookListPage(page);
    await bookListPage.goto();

    const unavailableCard = await bookListPage.getBookCardByTitle('The Pragmatic Programmer');
    await expect(unavailableCard.locator('.unavailable')).toHaveText('Unavailable');
  });

  test('should filter books by search term', async ({ page }) => {
    await page.route('**/api/books', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockBooks),
      });
    });

    const bookListPage = new BookListPage(page);
    await bookListPage.goto();

    await bookListPage.searchBooks('Clean');

    await expect(bookListPage.bookCards).toHaveCount(1);
    await expect(bookListPage.bookCards.first()).toContainText('Clean Code');
  });

  test('should filter books by author', async ({ page }) => {
    await page.route('**/api/books', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockBooks),
      });
    });

    const bookListPage = new BookListPage(page);
    await bookListPage.goto();

    await bookListPage.searchBooks('Gang of Four');

    await expect(bookListPage.bookCards).toHaveCount(1);
    await expect(bookListPage.bookCards.first()).toContainText('Design Patterns');
  });

  test('should show empty state when no books match search', async ({ page }) => {
    await page.route('**/api/books', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockBooks),
      });
    });

    const bookListPage = new BookListPage(page);
    await bookListPage.goto();

    await bookListPage.searchBooks('nonexistent book xyz');

    await expect(bookListPage.bookCards).toHaveCount(0);
  });

  test('should show empty state when no books exist', async ({ page }) => {
    await page.route('**/api/books', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    const bookListPage = new BookListPage(page);
    await bookListPage.goto();

    await expect(bookListPage.emptyState).toBeVisible();
    await expect(bookListPage.emptyState).toContainText('No books found');
  });

  test('should navigate to add book page', async ({ page }) => {
    await page.route('**/api/books', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockBooks),
      });
    });

    const bookListPage = new BookListPage(page);
    await bookListPage.goto();

    await bookListPage.clickAddBook();

    await expect(page).toHaveURL(/\/books\/new/);
  });

  test('should navigate to edit book page', async ({ page }) => {
    await page.route('**/api/books', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockBooks),
      });
    });

    await page.route('**/api/books/1', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockBooks[0]),
      });
    });

    const bookListPage = new BookListPage(page);
    await bookListPage.goto();

    await bookListPage.editBook('Clean Code');

    await expect(page).toHaveURL(/\/books\/edit\/1/);
  });

  test('should logout and redirect to sign in', async ({ page }) => {
    await page.route('**/api/books', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockBooks),
      });
    });

    const bookListPage = new BookListPage(page);
    await bookListPage.goto();

    await bookListPage.logout();

    await expect(page).toHaveURL(/\/signin/);
  });

  test('should display user name in header', async ({ page }) => {
    await page.route('**/api/books', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockBooks),
      });
    });

    const bookListPage = new BookListPage(page);
    await bookListPage.goto();

    await expect(bookListPage.userName).toHaveText('Test User');
  });
});
