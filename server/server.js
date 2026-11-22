import express from 'express';
import cors from 'cors';
import { getAllBooks, getBookById } from './booksStore.js';
import { parseId } from './validate.js';

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

  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
    console.log(`Allowed origin: ${CLIENT_ORIGIN}`);
  });