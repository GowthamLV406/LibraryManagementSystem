import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { createBook, updateBook, getBookById } from '../services/bookService';
import { getUser } from '../services/authService';
import './Books.css';

function BookForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const user = getUser();

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    publisher: '',
    category: '',
    language: '',
    shelfLocation: '',
    description: '',
    publishedDate: '',
    totalCopies: 1,
    availableCopies: 1,
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingBook, setFetchingBook] = useState(isEdit);

  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }
    if (isEdit) {
      loadBook();
    }
  }, [id]);

  const loadBook = async () => {
    try {
      const book = await getBookById(id);
      setFormData({
        title: book.title || '',
        author: book.author || '',
        isbn: book.isbn || '',
        publisher: book.publisher || '',
        category: book.category || '',
        language: book.language || '',
        shelfLocation: book.shelfLocation || '',
        description: book.description || '',
        publishedDate: book.publishedDate ? book.publishedDate.split('T')[0] : '',
        totalCopies: book.totalCopies || 1,
        availableCopies: book.availableCopies || 1,
      });
    } catch (err) {
      setApiError('Failed to load book details');
    } finally {
      setFetchingBook(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.author.trim()) newErrors.author = 'Author is required';
    if (!formData.isbn.trim()) newErrors.isbn = 'ISBN is required';
    if (!formData.publisher.trim()) newErrors.publisher = 'Publisher is required';
    if (!formData.category.trim()) newErrors.category = 'Category is required';
    if (!formData.language.trim()) newErrors.language = 'Language is required';
    if (!formData.shelfLocation.trim()) newErrors.shelfLocation = 'Shelf location is required';
    if (!formData.publishedDate) newErrors.publishedDate = 'Published date is required';
    if (!formData.totalCopies || formData.totalCopies < 1) newErrors.totalCopies = 'At least 1 copy required';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        totalCopies: parseInt(formData.totalCopies, 10),
        availableCopies: parseInt(formData.availableCopies, 10),
      };

      if (isEdit) {
        await updateBook(id, payload);
      } else {
        await createBook(payload);
      }
      navigate('/books');
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetchingBook) {
    return (
      <div className="books-page">
        <div className="books-loading">
          <div className="spinner"></div>
          <p>Loading book...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="books-page">
      <header className="books-header">
        <div className="books-brand">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
            <path d="M8 7h6" />
            <path d="M8 11h8" />
          </svg>
          <span>Library Management</span>
        </div>
        <Link to="/books" className="btn-back">
          ← Back to Books
        </Link>
      </header>

      <main className="books-main">
        <div className="form-page-header">
          <h1>{isEdit ? 'Edit Book' : 'Add New Book'}</h1>
          <p>{isEdit ? 'Update the book details below' : 'Fill in the details to add a new book to the library'}</p>
        </div>

        {apiError && <div className="books-error">{apiError}</div>}

        <form className="book-form" onSubmit={handleSubmit} noValidate>
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="title">Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter book title"
                className={errors.title ? 'error' : ''}
              />
              {errors.title && <span className="field-error">{errors.title}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="author">Author *</label>
              <input
                type="text"
                id="author"
                name="author"
                value={formData.author}
                onChange={handleChange}
                placeholder="Enter author name"
                className={errors.author ? 'error' : ''}
              />
              {errors.author && <span className="field-error">{errors.author}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="isbn">ISBN *</label>
              <input
                type="text"
                id="isbn"
                name="isbn"
                value={formData.isbn}
                onChange={handleChange}
                placeholder="e.g., 978-3-16-148410-0"
                className={errors.isbn ? 'error' : ''}
                disabled={isEdit}
              />
              {errors.isbn && <span className="field-error">{errors.isbn}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="publisher">Publisher *</label>
              <input
                type="text"
                id="publisher"
                name="publisher"
                value={formData.publisher}
                onChange={handleChange}
                placeholder="Enter publisher name"
                className={errors.publisher ? 'error' : ''}
              />
              {errors.publisher && <span className="field-error">{errors.publisher}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="category">Category *</label>
              <input
                type="text"
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="e.g., Fiction, Science, History"
                className={errors.category ? 'error' : ''}
              />
              {errors.category && <span className="field-error">{errors.category}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="language">Language *</label>
              <input
                type="text"
                id="language"
                name="language"
                value={formData.language}
                onChange={handleChange}
                placeholder="e.g., English"
                className={errors.language ? 'error' : ''}
              />
              {errors.language && <span className="field-error">{errors.language}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="shelfLocation">Shelf Location *</label>
              <input
                type="text"
                id="shelfLocation"
                name="shelfLocation"
                value={formData.shelfLocation}
                onChange={handleChange}
                placeholder="e.g., A-12"
                className={errors.shelfLocation ? 'error' : ''}
              />
              {errors.shelfLocation && <span className="field-error">{errors.shelfLocation}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="publishedDate">Published Date *</label>
              <input
                type="date"
                id="publishedDate"
                name="publishedDate"
                value={formData.publishedDate}
                onChange={handleChange}
                className={errors.publishedDate ? 'error' : ''}
              />
              {errors.publishedDate && <span className="field-error">{errors.publishedDate}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="totalCopies">Total Copies *</label>
              <input
                type="number"
                id="totalCopies"
                name="totalCopies"
                value={formData.totalCopies}
                onChange={handleChange}
                min="1"
                className={errors.totalCopies ? 'error' : ''}
              />
              {errors.totalCopies && <span className="field-error">{errors.totalCopies}</span>}
            </div>

            {isEdit && (
              <div className="form-field">
                <label htmlFor="availableCopies">Available Copies</label>
                <input
                  type="number"
                  id="availableCopies"
                  name="availableCopies"
                  value={formData.availableCopies}
                  onChange={handleChange}
                  min="0"
                  max={formData.totalCopies}
                />
              </div>
            )}

            <div className="form-field full-width">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief description of the book"
                rows="4"
              />
            </div>
          </div>

          <div className="form-actions">
            <Link to="/books" className="btn-cancel">Cancel</Link>
            <button type="submit" className="btn-save" disabled={loading}>
              {loading
                ? (isEdit ? 'Updating...' : 'Creating...')
                : (isEdit ? 'Update Book' : 'Add Book')}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default BookForm;
