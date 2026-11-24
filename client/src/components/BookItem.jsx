export default function BookItem({ book, busy, onToggleRead, onRate, onEdit, onDelete }) {
    return (
      <li className="book-item">
        <div>
          <strong>{book.title}</strong> by {book.author} ({book.year}) · {book.genre}
        </div>
  
        <div className="actions">
          <button onClick={() => onToggleRead(book)} disabled={busy}>
            {book.read ? 'Mark as unread' : 'Mark as read'}
          </button>
  
          <select
            aria-label="Rating"
            value={book.rating ?? ''}
            disabled={busy}
            onChange={(e) => onRate(book, e.target.value === '' ? null : Number(e.target.value))}
          >
            <option value="">No rating</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {'★'.repeat(n)}
              </option>
            ))}
          </select>
  
          <button onClick={() => onEdit(book)} disabled={busy}>
            Edit
          </button>
          <button onClick={() => onDelete(book)} disabled={busy}>
            Delete
          </button>
        </div>
      </li>
    );
  }