import express from 'express';
import cors from 'cors';
import { getAllBooks } from './booksStore.js';

const PORT = process.env.PORT || 3000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN ||'http://localhost:5173'; 

const app= express();

app.use(cors({origin: CLIENT_ORIGIN}));

app.use(express.json());

app.get('/api/books', async (req, res) => {
    const books = await getAllBooks();
    res.status(200).json(books);
  });

  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
    console.log(`Allowed origin: ${CLIENT_ORIGIN}`);
  });