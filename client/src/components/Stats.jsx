export default function Stats({ stats }) {
    if (!stats) return null;
    return (
      <section className="stats">
        <h2>Statistics</h2>
        <p>
          Total: {stats.total} · Read: {stats.read} · Unread: {stats.unread} · Average rating:{' '}
          {stats.averageRating ?? 'no ratings yet'}
        </p>
        <ul>
          {Object.entries(stats.byGenre).map(([genre, count]) => (
            <li key={genre}>
              {genre}: {count}
            </li>
          ))}
        </ul>
      </section>
    );
  }