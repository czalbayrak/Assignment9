
const API_URL = import.meta.env.VITE_API_URL;

async function request(path, { method = 'GET', body, signal } = {}) {
  const options = { method, signal };

  if (body !== undefined) {
    options.headers = { 'Content-Type': 'application/json' };
    options.body = JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, options);
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new Error('Cannot reach the server. Is it running?');
  }

  if (response.status === 204) {
    return null;
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }
  return data;
}

export function getBooks(filters = {}, signal) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== '' && value !== undefined && value !== null) {
      params.set(key, value);
    }
  }
  const query = params.toString();
  return request(`/api/books${query ? `?${query}` : ''}`, { signal });
}

export function createBook(book) {
  return request('/api/books', { method: 'POST', body: book });
}

export function replaceBook(id, book) {
  return request(`/api/books/${id}`, { method: 'PUT', body: book });
}

export function patchBook(id, changes) {
  return request(`/api/books/${id}`, { method: 'PATCH', body: changes });
}

export function deleteBook(id) {
  return request(`/api/books/${id}`, { method: 'DELETE' });
}

export function getStats() {
  return request('/api/stats');
}