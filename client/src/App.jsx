import { useEffect, useState } from 'react';
import * as api from './api/books.js';
import FilterBar from './components/FilterBar.jsx';
import BookList from './components/BookList.jsx';
import BookForm from './components/BookForm.jsx';
import Stats from './components/Stats.jsx';

const INITIAL_FILTERS = { q: '', genre: '', read: '', sort: '', order: 'asc' };

export default function App() {
  const [books, setBooks] = useState([]);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(''); 
  const [actionError, setActionError] = useState(''); 
  const [busyId, setBusyId] = useState(null); 
  const [editingBook, setEditingBook] = useState(null);
  const [stats, setStats] = useState(null);

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

  useEffect(() => {
    refreshStats();
  }, []);

  async function refreshStats() {
    try {
      setStats(await api.getStats());
    } catch (err) {
      setActionError(err.message);
    }
  }

  function reloadList() {
    setFilters((prev) => ({ ...prev }));
  }

  async function handleAdd(book) {
    await api.createBook(book); 
    reloadList(); 
    await refreshStats();
  }

  async function handleEdit(book) {
    const updated = await api.replaceBook(editingBook.id, book);
    setBooks((prev) => prev.map((b) => (b.id === updated.id ? updated : b))); 
    setEditingBook(null);
    await refreshStats();
  }

  async function patch(book, changes) {
    setBusyId(book.id);
    setActionError('');
    try {
      const updated = await api.patchBook(book.id, changes);
      setBooks((prev) => prev.map((b) => (b.id === updated.id ? updated : b))); 
      await refreshStats();
    } catch (err) {
      setActionError(err.message); 
    } finally {
      setBusyId(null);
    }
  }

  function handleToggleRead(book) {
    patch(book, { read: !book.read });
  }

  function handleRate(book, rating) {
    patch(book, { rating });
  }

  async function handleDelete(book) {
    if (!window.confirm(`Delete "${book.title}"?`)) return;
    setBusyId(book.id);
    setActionError('');
    try {
      await api.deleteBook(book.id);
      setBooks((prev) => prev.filter((b) => b.id !== book.id)); 
      await refreshStats();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main>
      <h1>Reading List</h1>

      <Stats stats={stats} />

      {editingBook ? (
        <BookForm
          key={editingBook.id}
          initialBook={editingBook}
          onSubmit={handleEdit}
          onCancel={() => setEditingBook(null)}
        />
      ) : (
        <BookForm onSubmit={handleAdd} />
      )}

      <FilterBar filters={filters} onChange={setFilters} />

      {actionError && <p className="error">{actionError}</p>}

      {loading && <p>Loading books...</p>}
      {!loading && error && <p className="error">{error}</p>}
      {!loading && !error && books.length === 0 && <p>No books found.</p>}
      {!loading && !error && books.length > 0 && (
        <BookList
          books={books}
          busyId={busyId}
          onToggleRead={handleToggleRead}
          onRate={handleRate}
          onEdit={setEditingBook}
          onDelete={handleDelete}
        />
      )}
    </main>
  );
}