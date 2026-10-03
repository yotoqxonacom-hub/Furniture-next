/**
 * Turns whatever came back (string, array of strings, `{ message }` object, Apollo error) into one string.
 * An object used to reach the alert as is and showed "[object Object]".
 */
export const errorMessageOf = (value: any): string => {
	if (value == null) return '';
	if (typeof value === 'string') return value;
	if (Array.isArray(value)) return value.map(errorMessageOf).filter(Boolean).join(', ');
	if (typeof value === 'object') {
		if (value.graphQLErrors?.length) return errorMessageOf(value.graphQLErrors[0]?.message);
		if ('message' in value) return errorMessageOf(value.message);
	}
	return '';
};
