import { getToken } from './authService';

const API_BASE = 'http://localhost:5271/api/books';

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`,
  };
}

export async function getAllBooks() {
  const res = await fetch(API_BASE, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch books');
  return res.json();
}

export async function getBookById(id) {
  const res = await fetch(`${API_BASE}/${id}`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Book not found');
  return res.json();
}

export async function createBook(book) {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(book),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to create book');
  return data;
}

export async function updateBook(id, book) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(book),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update book');
  return data;
}

export async function deleteBook(id) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete book');
}
