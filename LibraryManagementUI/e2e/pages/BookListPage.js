export class BookListPage {
  constructor(page) {
    this.page = page;
    this.heading = page.locator('h1', { hasText: 'Books' });
    this.searchInput = page.locator('.search-box input');
    this.addBookButton = page.locator('.btn-add', { hasText: 'Add Book' });
    this.bookCards = page.locator('.book-card');
    this.booksCount = page.locator('.books-count');
    this.logoutButton = page.locator('.btn-logout');
    this.userName = page.locator('.user-name');
    this.loadingSpinner = page.locator('.books-loading');
    this.emptyState = page.locator('.books-empty');
    this.errorMessage = page.locator('.books-error');
  }

  async goto() {
    await this.page.goto('/books');
  }

  async searchBooks(term) {
    await this.searchInput.fill(term);
  }

  async clickAddBook() {
    await this.addBookButton.click();
  }

  async getBookCount() {
    return this.bookCards.count();
  }

  async getBookCardByTitle(title) {
    return this.page.locator('.book-card', { hasText: title });
  }

  async editBook(title) {
    const card = await this.getBookCardByTitle(title);
    await card.locator('.btn-edit').click();
  }

  async deleteBook(title) {
    const card = await this.getBookCardByTitle(title);
    await card.locator('.btn-delete').click();
    await card.locator('.btn-confirm-delete').click();
  }

  async logout() {
    await this.logoutButton.click();
  }
}
