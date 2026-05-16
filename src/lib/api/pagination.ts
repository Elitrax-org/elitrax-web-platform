export type KeysetPageResult<T> = {
  readonly items: readonly T[];
  readonly nextCursor: string | null;
};

type DecodedCursor = {
  readonly ts: string;
  readonly id: string;
};

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/**
 * Convierte limit de query-string a un valor acotado y seguro.
 */
export function parseLimit(raw: string | null | undefined): number {
  if (!raw) return DEFAULT_LIMIT;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return DEFAULT_LIMIT;
  const int = Math.floor(parsed);
  if (int <= 0) return DEFAULT_LIMIT;
  if (int > MAX_LIMIT) return MAX_LIMIT;
  return int;
}

function encodeCursor(value: DecodedCursor): string {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
}

function decodeCursor(raw: string | null | undefined): DecodedCursor | null {
  if (!raw) return null;
  try {
    const json = Buffer.from(raw, "base64url").toString("utf8");
    const parsed = JSON.parse(json) as Partial<DecodedCursor>;
    if (typeof parsed.ts !== "string" || typeof parsed.id !== "string") {
      return null;
    }
    return { ts: parsed.ts, id: parsed.id };
  } catch {
    return null;
  }
}

/**
 * Paginación keyset in-memory para listas ya cargadas.
 *
 * Ordena por timestamp desc y usa id desc como desempate para estabilidad.
 * El cursor codifica el último elemento visible de la página actual.
 */
export function paginateByKeyset<T>(
  items: readonly T[],
  options: {
    readonly limit: number;
    readonly cursor?: string | null;
    readonly getTimestamp: (item: T) => string;
    readonly getId: (item: T) => string;
  },
): KeysetPageResult<T> {
  const cursor = decodeCursor(options.cursor);

  const sorted = [...items].sort((left, right) => {
    const lt = options.getTimestamp(left);
    const rt = options.getTimestamp(right);
    if (lt !== rt) return rt.localeCompare(lt);
    const lid = options.getId(left);
    const rid = options.getId(right);
    return rid.localeCompare(lid);
  });

  const filtered = cursor
    ? sorted.filter((item) => {
        const ts = options.getTimestamp(item);
        const id = options.getId(item);
        return ts < cursor.ts || (ts === cursor.ts && id < cursor.id);
      })
    : sorted;

  const page = filtered.slice(0, options.limit);
  const hasMore = filtered.length > page.length;
  if (!hasMore || page.length === 0) {
    return { items: page, nextCursor: null };
  }

  const last = page[page.length - 1];
  return {
    items: page,
    nextCursor: encodeCursor({
      ts: options.getTimestamp(last),
      id: options.getId(last),
    }),
  };
}
