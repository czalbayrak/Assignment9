import { useEffect, useState } from 'react';
import { getBooks } from './api/books.js';

export default function App() {
  const [count, setCount] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getBooks()
      .then((books) => setCount(books.length))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <main>
      <h1>Reading List</h1>
      {error && <p>{error}</p>}
      {count !== null && <p>The server has {count} books.</p>}
    </main>
  );
}