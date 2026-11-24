import BookItem from './BookItem.jsx';

export default function BookList({ books, ...handlers }) {
  return (
    <ul className="book-list">
      {books.map((book) => (
        <BookItem key={book.id} book={book} {...handlers} />
      ))}
    </ul>
  );
}