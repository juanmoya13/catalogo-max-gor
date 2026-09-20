import { NextResponse } from "next/server";

import {
  listPublicProducts,
  normalizeFilterValueSelection,
  normalizeSearchQuery,
  normalizeSortBy,
} from "@/lib/catalog/public";

const DEFAULT_LIMIT = 8;
const MAX_LIMIT = 24;

function parseNonNegativeInteger(value: string | null, fallback: number) {
  if (value === null || !/^\d+$/.test(value)) {
    return fallback;
  }

  return Number(value);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const offset = parseNonNegativeInteger(searchParams.get("offset"), 0);
  const requestedLimit = parseNonNegativeInteger(searchParams.get("limit"), DEFAULT_LIMIT);
  const limit = Math.min(Math.max(requestedLimit, 1), MAX_LIMIT);

  const products = await listPublicProducts({
    searchQuery: normalizeSearchQuery(searchParams.get("search") ?? undefined),
    filterValues: normalizeFilterValueSelection(searchParams.getAll("filterValues")),
    sortBy: normalizeSortBy(searchParams.get("sortBy") ?? undefined),
    offset,
    limit: limit + 1,
  });

  return NextResponse.json({
    products: products.slice(0, limit),
    hasMore: products.length > limit,
  });
}