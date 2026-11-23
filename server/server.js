import express from 'express';
import cors from 'cors';
import {
  getAllBooks,
  getBookById,
  createBook,
  findDuplicate,
  updateBook,
  deleteBook,
} from './booksStore.js';
import { parseId, validateBook, mergePatch, validateQuery } from './validate.js';

const PORT = process.env.PORT || 3000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

const app = express();

app.use(cors({ origin: CLIENT_ORIGIN }));

app.use(express.json());


function applyQuery(books, options) {
  let result = books;

  if (options.genre) {
    result = result.filter((b) => b.genre === options.genre);
  }
  if (options.read !== undefined) {
    result = result.filter((b) => b.read === options.read);
  }
  if (options.q) {
    result = result.filter(
      (b) =>
        b.title.toLowerCase().includes(options.q) ||
        b.author.toLowerCase().includes(options.q)
    );
  }

  const field = options.sort ?? 'id'; 
  const direction = options.order === 'desc' ? -1 : 1;

  result = result.toSorted((a, b) => {
    const x = a[field];
    const y = b[field];
    if (x === y) return 0;
    if (x === null) return 1;
    if (y === null) return -1;
    if (typeof x === 'string') return x.localeCompare(y) * direction;
    return (x - y) * direction;
  });

  const start = (options.page - 1) * options.limit;
  return result.slice(start, start + options.limit);
}

app.get('/api/books', async (req, res) => {
  const { error, value } = validateQuery(req.query);
  if (error) {
    return res.status(400).json({ error });
  }
  const books = await getAllBooks();
  res.status(200).json(applyQuery(books, value));
});

app.get('/api/books/:id', async (req, res) => {
  const { error, value: id } = parseId(req.params.id);
  if (error) {
    return res.status(400).json({ error });
  }
  const book = await getBookById(id);
  if (!book) {
    return res.status(404).json({ error: `Book with id ${id} not found` });
  }
  res.status(200).json(book);
});

app.post('/api/books', async (req, res) => {
  const { error, value } = validateBook(req.body);
  if (error) {
    return res.status(400).json({ error });
  }
  const duplicate = await findDuplicate(value.title, value.author);
  if (duplicate) {
    return res
      .status(409)
      .json({ error: `A book with this title and author already exists (id ${duplicate.id})` });
  }
  const book = await createBook(value);
  res.status(201).location(`/api/books/${book.id}`).json(book);
});

app.put('/api/books/:id', async (req, res) => {
  const idCheck = parseId(req.params.id);
  if (idCheck.error) {
    return res.status(400).json({ error: idCheck.error });
  }
  const id = idCheck.value;

  const existing = await getBookById(id);
  if (!existing) {
    return res.status(404).json({ error: `Book with id ${id} not found` });
  }

  const { error, value } = validateBook(req.body);
  if (error) {
    return res.status(400).json({ error });
  }

  const duplicate = await findDuplicate(value.title, value.author, id);
  if (duplicate) {
    return res
      .status(409)
      .json({ error: `A book with this title and author already exists (id ${duplicate.id})` });
  }

  const updated = await updateBook(id, value);
  res.status(200).json(updated);
});

app.patch('/api/books/:id', async (req, res) => {
  const idCheck = parseId(req.params.id);
  if (idCheck.error) {
    return res.status(400).json({ error: idCheck.error });
  }
  const id = idCheck.value;

  const existing = await getBookById(id);
  if (!existing) {
    return res.status(404).json({ error: `Book with id ${id} not found` });
  }

  const { error, value } = mergePatch(existing, req.body);
  if (error) {
    return res.status(400).json({ error });
  }

  const duplicate = await findDuplicate(value.title, value.author, id);
  if (duplicate) {
    return res
      .status(409)
      .json({ error: `A book with this title and author already exists (id ${duplicate.id})` });
  }

  const updated = await updateBook(id, value);
  res.status(200).json(updated);
});

app.delete('/api/books/:id', async (req, res) => {
  const { error, value: id } = parseId(req.params.id);
  if (error) {
    return res.status(400).json({ error });
  }
  const deleted = await deleteBook(id);
  if (!deleted) {
    return res.status(404).json({ error: `Book with id ${id} not found` });
  }
  res.status(204).end();
});

app.get('/api/stats', async (req, res) => {
  const books = await getAllBooks();

  const readCount = books.filter((b) => b.read).length;
  const rated = books.filter((b) => b.rating !== null);
  const averageRating =
    rated.length === 0
      ? null
      : Math.round((rated.reduce((sum, b) => sum + b.rating, 0) / rated.length) * 10) / 10;

  const byGenre = books.reduce(
    (acc, b) => ({ ...acc, [b.genre]: (acc[b.genre] ?? 0) + 1 }),
    {}
  );

  res.status(200).json({
    total: books.length,
    read: readCount,
    unread: books.length - readCount,
    averageRating,
    byGenre,
  });
});

app.get('/api/crash', async (req, res) => {
  throw new Error('Deliberate crash to test the error handler');
});

app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Malformed JSON in request body' });
  }
  console.error(err); 
  res.status(500).json({ error: 'Something went wrong' }); 
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
  console.log(`Allowed origin: ${CLIENT_ORIGIN}`);
});