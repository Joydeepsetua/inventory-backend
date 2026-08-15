export function normalizeOptional(value?: string | null): string | null | undefined {
  if (value === undefined) return undefined;
  const trimmed = typeof value === "string" ? value.trim() : value;
  return trimmed === "" ? null : trimmed;
}

export function normalizeOptionalFields<T extends object>(
  payload: T,
  fields: readonly (keyof T)[]
): T {
  const result = { ...payload } as Record<string, unknown>;

  fields.forEach((field) => {
    const key = field as string;

    if (key in result) {
      result[key] = normalizeOptional(result[key] as string | null | undefined);
    }
  });

  return result as T;
}
