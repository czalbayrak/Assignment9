export const GENRES = ['fiction', 'non-fiction', 'science', 'history', 'fantasy', 'other'];
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