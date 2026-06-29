import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllBooks, deleteBook } from '../services/bookService';
import { getUser, logout } from '../services/authService';
import './Books.css';

function BookList() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const navigate = useNavigate();
  const user = getUser();

  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const data = await getAllBooks();
      setBooks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteBook(id);
      setBooks(books.filter((b) => b.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  const filtered = books.filter(
    (b) =>
      b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.isbn.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <div className="books-header-actions">
          <span className="user-name">{user?.fullName}</span>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      </header>

      <main className="books-main">
        <div className="books-toolbar">
          <div>
            <h1>Books</h1>
            <p className="books-count">{filtered.length} book{filtered.length !== 1 ? 's' : ''} found</p>
          </div>
          <div className="books-toolbar-right">
            <div className="search-box">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                type="text"
                placeholder="Search books..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Link to="/books/new" className="btn-add">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14" />
                <path d="M5 12h14" />
              </svg>
              Add Book
            </Link>
          </div>
        </div>

        {error && <div className="books-error">{error}</div>}

        {loading ? (
          <div className="books-loading">
            <div className="spinner"></div>
            <p>Loading books...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="books-empty">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
            </svg>
            <h3>No books found</h3>
            <p>
              {searchTerm
                ? 'Try a different search term'
                : 'Get started by adding your first book'}
            </p>
            {!searchTerm && (
              <Link to="/books/new" className="btn-add">Add Your First Book</Link>
            )}
          </div>
        ) : (
          <div className="books-grid">
            {filtered.map((book) => (
              <div key={book.id} className="book-card">
                <div className="book-card-header">
                  <span className="book-category">{book.category}</span>
                  <span className={`book-availability ${book.availableCopies > 0 ? 'available' : 'unavailable'}`}>
                    {book.availableCopies > 0 ? 'Available' : 'Unavailable'}
                  </span>
                </div>
                <h3 className="book-title">{book.title}</h3>
                <p className="book-author">by {book.author}</p>
                <div className="book-meta">
                  <span>ISBN: {book.isbn}</span>
                  <span>{book.language}</span>
                </div>
                <div className="book-meta">
                  <span>Shelf: {book.shelfLocation}</span>
                  <span>{book.availableCopies}/{book.totalCopies} copies</span>
                </div>
                <div className="book-actions">
                  <Link to={`/books/edit/${book.id}`} className="btn-edit">Edit</Link>
                  {deleteConfirm === book.id ? (
                    <div className="delete-confirm">
                      <button onClick={() => handleDelete(book.id)} className="btn-confirm-delete">Confirm</button>
                      <button onClick={() => setDeleteConfirm(null)} className="btn-cancel-delete">Cancel</button>
                    </div>
                  ) : (
                    <button onClick={() => setDeleteConfirm(book.id)} className="btn-delete">Delete</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default BookList;
