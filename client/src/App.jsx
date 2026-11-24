import { useEffect, useState } from 'react';
import * as api from './api/books.js';
import FilterBar from './components/FilterBar.jsx';
import BookList from './components/BookList.jsx';

const INITIAL_FILTERS = { q: '', genre: '', read: '', sort: '', order: 'asc' };

export default function App() {
  const [books, setBooks] = useState([]);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');

    api
      .getBooks(filters, controller.signal)
      .then((data) => {
        setBooks(data);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return; 
        setError(err.message);
        setLoading(false);
      });

    return () => controller.abort();
  }, [filters]);

  return (
    <main>
      <h1>Reading List</h1>

      <FilterBar filters={filters} onChange={setFilters} />

      {loading && <p>Loading books...</p>}
      {!loading && error && <p className="error">{error}</p>}
      {!loading && !error && books.length === 0 && <p>No books found.</p>}
      {!loading && !error && books.length > 0 && <BookList books={books} />}
    </main>
  );
}