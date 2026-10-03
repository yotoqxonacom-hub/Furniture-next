/**
 * Shop filter rules in one place (pure functions, no React).
 *
 * The URL (/product?input=…) keeps what the user picked; `toProductsQuery()` turns that into
 * what the backend's getProducts expects. Keeping the two apart lets the UI show "5+" while
 * the backend, which matches lists with $in, receives 5, 6, 7 ….
 */
import { ProductsInquiry } from './types/product/product.input';

/** "no upper limit". Must fit GraphQL Int (backend PricesRange / SquaresRange are Int). */
export const NO_LIMIT = 2147483647;

/** seats / pieces chips: 1 2 3 4 5+ */
export const COUNT_OPTIONS = [1, 2, 3, 4, 5];
export const COUNT_PLUS = 5;
/** what "5+" expands to when querying (backend uses $in, so ranges must be listed) */
const COUNT_PLUS_MAX = 30;

type Range = { start: number; end: number };
type Search = Record<string, any>;

/** range bound -> input text; an open bound is shown as an empty input */
export const rangeText = (value?: number): string => (value === undefined || value === NO_LIMIT ? '' : String(value));

/**
 * Price inputs -> pricesRange, or undefined when it would not filter anything
 * (both empty, or "from 0" with no upper bound). Swaps the bounds if they are reversed.
 */
export const buildPriceRange = (startText: string, endText: string): Range | undefined => {
	const start = Math.max(0, Number(startText) || 0);
	const end = endText.trim() === '' ? NO_LIMIT : Math.max(0, Number(endText) || 0);
	if (start === 0 && end === NO_LIMIT) return undefined;
	return start <= end ? { start, end } : { start: end, end: start };
};

/** Size selects -> squaresRange, or undefined for "any size" */
export const buildSizeRange = (start: number, end: number): Range | undefined => {
	if (start === 0 && end === NO_LIMIT) return undefined;
	return start <= end ? { start, end } : { start: end, end: start };
};

/** sets or removes one key so empty filters never reach the URL */
export const withFilter = (search: Search, key: string, value: unknown): Search => {
	const next = { ...search };
	const empty = value === undefined || value === '' || (Array.isArray(value) && value.length === 0);
	if (empty) delete next[key];
	else next[key] = value;
	return next;
};

/** adds the value if missing, removes it if present */
export const toggleIn = (search: Search, key: string, value: unknown): Search => {
	const current: unknown[] = search?.[key] ?? [];
	const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
	return withFilter(search, key, next);
};

/** order-insensitive comparison, used to skip navigation when nothing changed */
export const sameSearch = (a: Search = {}, b: Search = {}): boolean => {
	const normalize = (s: Search) =>
		JSON.stringify(
			Object.keys(s)
				.sort()
				.map((k) => [k, Array.isArray(s[k]) ? [...s[k]].sort() : s[k]]),
		);
	return normalize(a) === normalize(b);
};

/** [2, 5] -> [2, 5, 6, …, 30] so "5+" also matches 6, 7 … */
const expandCountPlus = (list?: number[]): number[] | undefined => {
	if (!list?.length) return undefined;
	if (!list.includes(COUNT_PLUS)) return list;
	const plus = Array.from({ length: COUNT_PLUS_MAX - COUNT_PLUS + 1 }, (_, i) => COUNT_PLUS + i);
	return Array.from(new Set([...list, ...plus]));
};

/** URL inquiry -> getProducts input */
export const toProductsQuery = (inquiry: ProductsInquiry): ProductsInquiry => {
	let search: Search = { ...(inquiry.search ?? {}) };
	search = withFilter(search, 'bedsList', expandCountPlus(search.bedsList));
	search = withFilter(search, 'roomsList', expandCountPlus(search.roomsList));
	return { ...inquiry, search };
};
