const GENRES = ['fiction', 'non-fiction', 'science', 'history', 'fantasy', 'other'];

export default function FilterBar({ filters, onChange }) {
  function update(field, value) {
    onChange({ ...filters, [field]: value }); // yeni nesne, eskisini değiştirmiyoruz
  }

  return (
    <div className="filter-bar">
      <input
        type="search"
        placeholder="Search title or author"
        value={filters.q}
        onChange={(e) => update('q', e.target.value)}
      />

      <select value={filters.genre} onChange={(e) => update('genre', e.target.value)}>
        <option value="">All genres</option>
        {GENRES.map((g) => (
          <option key={g} value={g}>
            {g}
          </option>
        ))}
      </select>

      <select value={filters.read} onChange={(e) => update('read', e.target.value)}>
        <option value="">Read and unread</option>
        <option value="true">Read</option>
        <option value="false">Unread</option>
      </select>

      <select value={filters.sort} onChange={(e) => update('sort', e.target.value)}>
        <option value="">Default order</option>
        <option value="title">Title</option>
        <option value="author">Author</option>
        <option value="year">Year</option>
        <option value="rating">Rating</option>
      </select>

      <select value={filters.order} onChange={(e) => update('order', e.target.value)}>
        <option value="asc">Ascending</option>
        <option value="desc">Descending</option>
      </select>
    </div>
  );
}