const DEFAULT_LIMIT = 6;
const MAX_LIMIT = 50;

export const parsePaginationParams = (query = {}) => {
  const parsedLimit = Number.parseInt(query.limit, 10);
  const limit = Number.isNaN(parsedLimit)
    ? DEFAULT_LIMIT
    : Math.min(Math.max(parsedLimit, 1), MAX_LIMIT);

  let cursorId = null;
  if (query.cursor) {
    try {
      const decoded = JSON.parse(
        Buffer.from(String(query.cursor), "base64").toString("utf8")
      );
      if (Number.isInteger(decoded?.id) && decoded.id > 0) {
        cursorId = decoded.id;
      }
    } catch (_error) {
      cursorId = null;
    }
  }

  return { limit, cursorId };
};

export const encodeCursor = (id) =>
  Buffer.from(JSON.stringify({ id }), "utf8").toString("base64");
