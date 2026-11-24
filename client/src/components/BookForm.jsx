import { useState } from 'react';

const GENRES = ['fiction', 'non-fiction', 'science', 'history', 'fantasy', 'other'];
const EMPTY = { title: '', author: '', year: '', genre: 'fiction', read: false, rating: '' };

function toFormValues(book) {
  if (!book) return EMPTY;
  return {
    title: book.title,
    author: book.author,
    year: String(book.year),
    genre: book.genre,
    read: book.read,
    rating: book.rating === null ? '' : String(book.rating),
  };
}

export default function BookForm({ initialBook, onSubmit, onCancel }) {
  const [values, setValues] = useState(toFormValues(initialBook));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e) {
    const { name, type, value, checked } = e.target;
    setValues((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const book = {
      title: values.title,
      author: values.author,
      year: Number(values.year),
      genre: values.genre,
      read: values.read,
      rating: values.rating === '' ? null : Number(values.rating),
    };

    try {
      await onSubmit(book);
      if (!initialBook) setValues(EMPTY); 
    } catch (err) {
      setError(err.message); 
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="book-form" onSubmit={handleSubmit}>
      <h2>{initialBook ? `Edit "${initialBook.title}"` : 'Add a book'}</h2>

      <label>
        Title <input name="title" value={values.title} onChange={handleChange} />
      </label>
      <label>
        Author <input name="author" value={values.author} onChange={handleChange} />
      </label>
      <label>
        Year <input name="year" type="number" value={values.year} onChange={handleChange} />
      </label>
      <label>
        Genre{' '}
        <select name="genre" value={values.genre} onChange={handleChange}>
          {GENRES.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </label>
      <label>
        <input name="read" type="checkbox" checked={values.read} onChange={handleChange} /> Read
      </label>
      <label>
        Rating{' '}
        <select name="rating" value={values.rating} onChange={handleChange}>
          <option value="">No rating</option>
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </label>

      {error && <p className="error">{error}</p>}

      <button type="submit" disabled={saving}>
        {saving ? 'Saving...' : initialBook ? 'Save changes' : 'Add book'}
      </button>
      {onCancel && (
        <button type="button" onClick={onCancel} disabled={saving}>
          Cancel
        </button>
      )}
    </form>
  );
}