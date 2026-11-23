export const GENRES = ['fiction', 'non-fiction', 'science', 'history', 'fantasy', 'other'];

const SORT_FIELDS = ['title', 'author', 'year', 'rating'];
const QUERY_KEYS = ['genre', 'read', 'q', 'sort', 'order', 'limit', 'page'];

export function parseId(raw) {

    if (!/^\d+$/.test(raw)) {
        return { error: `id must be a positive integer, got "${raw}"` };
      }
      const id = Number(raw);
      if (id < 1) {
        return { error: `id must be a positive integer, got "${raw}"` };
      }
      return { value: id };
    }

    export function validateBook(body) {
        if (body === null || typeof body !== 'object' || Array.isArray(body)) {
          return { error: 'Request body must be a JSON object' };
        }
      
        const { title, author, year, genre } = body;
        // Gönderilmediyse varsayılan değerler
        const read = body.read === undefined ? false : body.read;
        const rating = body.rating === undefined ? null : body.rating;
      
        if (typeof title !== 'string' || title.trim().length < 1 || title.trim().length > 100) {
          return { error: 'title is required and must be a string of 1 to 100 characters' };
        }
        if (typeof author !== 'string' || author.trim().length < 1 || author.trim().length > 100) {
          return { error: 'author is required and must be a string of 1 to 100 characters' };
        }
      
        const currentYear = new Date().getFullYear();
        if (!Number.isInteger(year) || year < 1000 || year > currentYear) {
          return { error: `year must be an integer between 1000 and ${currentYear}` };
        }
        if (!GENRES.includes(genre)) {
          return { error: `genre must be one of: ${GENRES.join(', ')}` };
        }
        if (typeof read !== 'boolean') {
          return { error: 'read must be true or false' };
        }
        if (rating !== null && (!Number.isInteger(rating) || rating < 1 || rating > 5)) {
          return { error: 'rating must be an integer from 1 to 5, or null' };
        }
        if (rating !== null && read === false) {
          return { error: 'rating is only allowed when read is true' };
        }
      
        return {
          value: { title: title.trim(), author: author.trim(), year, genre, read, rating },
        };
      }
      export function mergePatch(existing, body) {
        if (body === null || typeof body !== 'object' || Array.isArray(body)) {
          return { error: 'Request body must be a JSON object' };
        }
        const allowed = ['title', 'author', 'year', 'genre', 'read', 'rating'];
        const changes = {};
        for (const key of allowed) {
          if (key in body) changes[key] = body[key]; // sadece bilinen alanlar
        }
        return validateBook({ ...existing, ...changes });
      }

export function validateQuery(query) {
    // Tekrarlanan parametre: Express onu dizi yapar (?genre=a&genre=b -> ['a','b'])
    for (const key of QUERY_KEYS) {
      if (Array.isArray(query[key])) {
        return { error: `Query parameter "${key}" must not be repeated` };
      }
    }
  
    const { genre, read, q, sort, order, limit, page } = query;
    const options = { order: 'asc', limit: 50, page: 1 }; // varsayılanlar
  
    if (genre !== undefined) {
      if (!GENRES.includes(genre)) {
        return { error: `genre must be one of: ${GENRES.join(', ')}` };
      }
      options.genre = genre;
    }
  
    if (read !== undefined) {
      if (read !== 'true' && read !== 'false') {
        return { error: 'read must be "true" or "false"' };
      }
      options.read = read === 'true'; // string -> boolean
    }
  
    if (q !== undefined) {
      options.q = q.trim().toLowerCase();
    }
  
    if (sort !== undefined) {
      if (!SORT_FIELDS.includes(sort)) {
        return { error: `sort must be one of: ${SORT_FIELDS.join(', ')}` };
      }
      options.sort = sort;
    }
  
    if (order !== undefined) {
      if (order !== 'asc' && order !== 'desc') {
        return { error: 'order must be "asc" or "desc"' };
      }
      options.order = order;
    }
  
    if (limit !== undefined) {
      const n = Number(limit);
      if (!/^\d+$/.test(limit) || n < 1 || n > 50) {
        return { error: 'limit must be an integer from 1 to 50' };
      }
      options.limit = n;
    }
  
    if (page !== undefined) {
      const n = Number(page);
      if (!/^\d+$/.test(page) || n < 1) {
        return { error: 'page must be a positive integer' };
      }
      options.page = n;
    }
  
    return { value: options };
  }     