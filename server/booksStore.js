const seedBooks = [
    { id: 1, title: 'The Hobbit', author: 'J.R.R Tolkien', year:1937, genre: 'fantasy', read: true, rating: 5 },
    { id: 2, title: '1984', author: 'George Orwell', year: 1949, genre: 'fiction', read: true, rating: 4 },
    { id: 3, title: 'A Brief History of Time', author: 'Stephen Hawking', year: 1988, genre: 'science', read: false, rating: null },
    { id: 4, title: 'Sapiens', author: 'Yuval Noah Harari', year: 2011, genre: 'history', read: true, rating: 4 },
    { id: 5, title: 'Dune', author: 'Frank Herbert', year: 1965, genre: 'fiction', read: false, rating: null },
    { id: 6, title: 'The Name of the Wind', author: 'Patrick Rothfuss', year: 2007, genre: 'fantasy', read: true, rating: null },
  ];
  
  let books = seedBooks;
  let nextId = 7;

  const delay = (ms = 50) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getAllBooks() {
  await delay();
  return books;
}

export async function getBookById(id) {
  await delay();
  return books.find((book) => book.id === id) ?? null;
}

export async function createBook(data) {
    await delay();
    const newBook = { ...data, id: nextId }; // id'yi sunucu verir
    nextId = nextId + 1;
    books = [...books, newBook]; // push DEĞİL: yeni dizi oluşturuyoruz
    return newBook;
  }
  export async function findDuplicate(title, author, excludeId = null) {
    await delay();
    const t = title.trim().toLowerCase();
    const a = author.trim().toLowerCase();
    return (
      books.find(
        (book) =>
          book.id !== excludeId &&
          book.title.toLowerCase() === t &&
          book.author.toLowerCase() === a
      ) ?? null
    );
  }
  export async function updateBook(id, data) {
    await delay();
    const exists = books.some((book) => book.id === id);
    if (!exists) return null;
    const updated = { ...data, id }; // id değişmez
    books = books.map((book) => (book.id === id ? updated : book)); // yeni dizi
    return updated;
  }
  export async function deleteBook(id) {
    await delay();
    const exists = books.some((book) => book.id === id);
    if(!exists) return false;
    books = books.filter((book) => book.id !== id);
    return true;
  }