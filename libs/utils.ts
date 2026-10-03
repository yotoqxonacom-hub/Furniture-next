import { API_URL } from './env';
import { intlLocale } from './i18n';
import numeral from 'numeral';
import { sweetMixinErrorAlert } from './sweetAlert';

export const formatterStr = (value: number | undefined): string => {
	return numeral(value).format('0,0') != '0' ? numeral(value).format('0,0') : '';
};

export const likeTargetProductHandler = async (likeTargetProduct: any, id: string) => {
	try {
		await likeTargetProduct({
			variables: {
				input: id,
			},
		});
	} catch (err: any) {
		console.log('ERROR, likeTargetProductHandler:', err.message);
		sweetMixinErrorAlert(err.message).then();
	}
};

export const likeTargetBoardArticleHandler = async (likeTargetBoardArticle: any, id: string) => {
	try {
		await likeTargetBoardArticle({
			variables: {
				input: id,
			},
		});
	} catch (err: any) {
		console.log('ERROR, likeTargetBoardArticleHandler:', err.message);
		sweetMixinErrorAlert(err.message).then();
	}
};

export const likeTargetMemberHandler = async (likeTargetMember: any, id: string) => {
	try {
		await likeTargetMember({
			variables: {
				input: id,
			},
		});
	} catch (err: any) {
		console.log('ERROR, likeTargetMemberHandler:', err.message);
		sweetMixinErrorAlert(err.message).then();
	}
};

/** Full URL for an uploaded image, with a local fallback */
export const imageUrl = (path?: string | null, fallback: string = '/img/furniture/placeholder.svg'): string => {
	if (!path) return fallback;
	if (path.startsWith('http') || path.startsWith('/')) return path;
	return `${API_URL}/${path}`;
};

export const memberImageUrl = (path?: string | null): string => imageUrl(path, '/img/profile/defaultUser.svg');

export const formatPrice = (value?: number): string => {
	if (value === undefined || value === null) return '';
	return `$${numeral(value).format('0,0')}`;
};

/** "5 minutes ago" / "5분 전" / "5 daqiqa oldin" — in the active app language */
export const timeAgo = (date?: Date | string): string => {
	if (!date) return '';
	const seconds = Math.round((new Date(date).getTime() - Date.now()) / 1000);
	const locale = intlLocale();
	const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
	const abs = Math.abs(seconds);
	if (abs < 60) return rtf.format(0, 'second');
	if (abs < 3600) return rtf.format(Math.round(seconds / 60), 'minute');
	if (abs < 86400) return rtf.format(Math.round(seconds / 3600), 'hour');
	if (abs < 86400 * 7) return rtf.format(Math.round(seconds / 86400), 'day');
	return new Date(date).toLocaleDateString(locale);
};

export const capitalize = (value?: string): string => {
	if (!value) return '';
	const lower = value.replace(/_/g, ' ').toLowerCase();
	return lower.charAt(0).toUpperCase() + lower.slice(1);
};

/** Link to the shop page with a prepared search filter */
export const productSearchLink = (search: Record<string, any> = {}, sort: string = 'createdAt'): string => {
	const input = { page: 1, limit: 9, sort, direction: 'DESC', search };
	return `/product?input=${encodeURIComponent(JSON.stringify(input))}`;
};

/** short, readable order number from the Mongo id: "#5F3A9C21" */
export const orderNumber = (id?: string): string => (id ? `#${id.slice(-8).toUpperCase()}` : '');

/** "3 Oct 2026" / "2026. 10. 3." in the active app language; withTime adds hours and minutes */
export const formatDate = (date?: Date | string, withTime: boolean = false): string => {
	if (!date) return '';
	const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
	if (withTime) Object.assign(options, { hour: '2-digit', minute: '2-digit' });
	return new Date(date).toLocaleString(intlLocale(), options);
};
