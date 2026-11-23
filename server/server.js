import express from 'express';
import cors from 'cors';
import { getAllBooks, getBookById, createBook, findDuplicate, updateBook } from './booksStore.js';
import { parseId, validateBook } from './validate.js';

const PORT = process.env.PORT || 3000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN ||'http://localhost:5173'; 

const app= express();

app.use(cors({origin: CLIENT_ORIGIN}));

app.use(express.json());

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
  
    // Kendisi hariç aynı başlık+yazar var mı?
    const duplicate = await findDuplicate(value.title, value.author, id);
    if (duplicate) {
      return res
        .status(409)
        .json({ error: `A book with this title and author already exists (id ${duplicate.id})` });
    }
  
    const updated = await updateBook(id, value);
    res.status(200).json(updated);
  });

  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
    console.log(`Allowed origin: ${CLIENT_ORIGIN}`);
  });