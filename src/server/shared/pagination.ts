import "server-only";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

export interface ListParams {
  page: number;
  pageSize: number;
  q?: string;
}

export interface PaginatedResult<T> {
  rows: T[];
  total: number;
  page: number;
  pageSize: number;
}

export function parseListParams(searchParams?: Record<string, string | string[] | undefined>): ListParams {
  const page = positiveNumber(firstValue(searchParams?.page), DEFAULT_PAGE);
  const pageSize = Math.min(positiveNumber(firstValue(searchParams?.pageSize), DEFAULT_PAGE_SIZE), MAX_PAGE_SIZE);
  const q = firstValue(searchParams?.q)?.trim() || undefined;

  return { page, pageSize, q };
}

export function offsetFor({ page, pageSize }: ListParams) {
  return (page - 1) * pageSize;
}

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function positiveNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}
