export class BookFormPage {
  constructor(page) {
    this.page = page;
    this.titleInput = page.locator('#title');
    this.authorInput = page.locator('#author');
    this.isbnInput = page.locator('#isbn');
    this.publisherInput = page.locator('#publisher');
    this.categoryInput = page.locator('#category');
    this.languageInput = page.locator('#language');
    this.shelfLocationInput = page.locator('#shelfLocation');
    this.descriptionInput = page.locator('#description');
    this.publishedDateInput = page.locator('#publishedDate');
    this.totalCopiesInput = page.locator('#totalCopies');
    this.availableCopiesInput = page.locator('#availableCopies');
    this.submitButton = page.locator('button[type="submit"]');
    this.apiError = page.locator('.books-error');
    this.backLink = page.locator('.btn-back');
    this.pageHeading = page.locator('h1');
  }

  async goto() {
    await this.page.goto('/books/new');
  }

  async fillBookForm({ title, author, isbn, publisher, category, language, shelfLocation, description, publishedDate, totalCopies, availableCopies }) {
    if (title) await this.titleInput.fill(title);
    if (author) await this.authorInput.fill(author);
    if (isbn) await this.isbnInput.fill(isbn);
    if (publisher) await this.publisherInput.fill(publisher);
    if (category) await this.categoryInput.fill(category);
    if (language) await this.languageInput.fill(language);
    if (shelfLocation) await this.shelfLocationInput.fill(shelfLocation);
    if (description) await this.descriptionInput.fill(description);
    if (publishedDate) await this.publishedDateInput.fill(publishedDate);
    if (totalCopies) { await this.totalCopiesInput.clear(); await this.totalCopiesInput.fill(String(totalCopies)); }
    if (availableCopies) { await this.availableCopiesInput.clear(); await this.availableCopiesInput.fill(String(availableCopies)); }
  }

  async submit() {
    await this.submitButton.click();
  }

  async goBack() {
    await this.backLink.click();
  }
}
