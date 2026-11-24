export default function BookItem({ book }) {
    return (
      <li className="book-item">
        <strong>{book.title}</strong> by {book.author} ({book.year}) · {book.genre} ·{' '}
        {book.read ? 'read' : 'unread'}
        {book.rating !== null && ` · ${'★'.repeat(book.rating)}`}
      </li>
    );
  }