/**
 * Immutable helpers for admin list filters (users, products, …).
 *
 * Every admin list keeps an inquiry `{ page, limit, sort, direction, search }` in React state.
 * These helpers always return a NEW object, so state is never mutated in place
 * (in-place changes used to leak into the page's default inquiry and survive navigation).
 */

/** value meaning "no filter" in admin tabs / selects */
export const ALL = 'ALL';

interface Inquiry {
	page: number;
	limit: number;
	search: Record<string, any>;
	[key: string]: any;
}

/**
 * Sets one search key and goes back to page 1.
 * `ALL`, '' or undefined remove the key (the backend expects it absent, not an invalid enum).
 */
export const withSearch = <I extends Inquiry>(inquiry: I, key: string, value: unknown): I => {
	const search = { ...(inquiry.search ?? {}) };
	if (value === undefined || value === ALL || value === '') delete search[key];
	else search[key] = value;
	return { ...inquiry, page: 1, search };
};

/** MUI TablePagination is 0-based, the backend is 1-based */
export const withPage = <I extends Inquiry>(inquiry: I, muiPage: number): I => ({ ...inquiry, page: muiPage + 1 });

/** new page size always restarts at page 1 */
export const withLimit = <I extends Inquiry>(inquiry: I, limit: number): I => ({ ...inquiry, limit, page: 1 });

/**
 * After removing the last row of the last page, step back one page instead of
 * showing an empty (out-of-range) page.
 */
export const pageAfterRemove = <I extends Inquiry>(inquiry: I, rowsLeftOnPage: number): I =>
	rowsLeftOnPage === 0 && inquiry.page > 1 ? { ...inquiry, page: inquiry.page - 1 } : inquiry;
