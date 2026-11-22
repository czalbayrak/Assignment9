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