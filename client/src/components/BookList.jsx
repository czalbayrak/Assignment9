import BookItem from './BookItem.jsx';

export default function BookList({ books, busyId, ...handlers }) {
  return (
    <ul className="book-list">
      {books.map((book) => (
        <BookItem key={book.id} book={book} busy={book.id === busyId} {...handlers} />
      ))}
    </ul>
  );
}