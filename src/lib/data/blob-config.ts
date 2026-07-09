export function hasBlobStorage(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
}

export function getBlobAccess(): "private" | "public" {
  return process.env.BLOB_STORE_ID ? "private" : "public";
}

export async function readJsonBlob<T>(pathname: string): Promise<T | null> {
  if (!hasBlobStorage()) return null;

  try {
    const { get } = await import("@vercel/blob");
    const result = await get(pathname, { access: getBlobAccess() });
    if (!result?.stream) return null;

    const text = await new Response(result.stream).text();
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}
