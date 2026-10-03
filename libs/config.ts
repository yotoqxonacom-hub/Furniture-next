import { API_URL } from './env';
import { BoardArticleCategory } from './enums/board-article.enum';
export const REACT_APP_API_URL = API_URL;

export const availableOptions = ['productBarter'];

const thisYear = new Date().getFullYear();

export const productYears: any = [];

for (let i = 1970; i <= thisYear; i++) {
	productYears.push(String(i));
}

export const productSquare = [0, 25, 50, 75, 100, 125, 150, 200, 300, 500];

export const Messages = {
	error1: 'Something went wrong!',
	error2: 'Please login first!',
	error3: 'Please fulfill all inputs!',
	error4: 'Message is empty!',
	error5: 'Only images with jpeg, jpg, png format allowed!',
};

export const topProductRank = 2;

export const communityTabs = [
	{ value: BoardArticleCategory.FREE, label: 'Free board', desc: 'Chat about anything home-related.' },
	{ value: BoardArticleCategory.INTERIOR, label: 'Interior', desc: 'Room tours, styling tips and before/after.' },
	{ value: BoardArticleCategory.RECOMMEND, label: 'Recommendations', desc: 'Pieces and sellers you would buy from again.' },
	{ value: BoardArticleCategory.NEWS, label: 'News', desc: 'Store news, sales and events.' },
];

/**
 * Public contacts shown in the footer and the help center.
 * Change them here only; every place reads from this object.
 */
export const CONTACTS = {
	phone: '010 8164 5634',
	email: 'yotoqxona.com@gmail.com',
	facebook: { url: 'https://www.facebook.com/' }, // replace with the page link when it exists
	instagram: { handle: '@ma1he.w', url: 'https://www.instagram.com/ma1he.w/' },
	telegram: { handle: '@MIMa1hew', url: 'https://t.me/MIMa1hew' },
};

/** "010 8164 5634" -> "tel:+821081645634" (Korean local number -> international, works from any phone) */
export const telHref = (phone: string) => {
	const digits = phone.replace(/[^\d+]/g, '');
	return `tel:${digits.startsWith('0') ? `+82${digits.slice(1)}` : digits}`;
};

/**
 * Order rules — keep in sync with ORDER_RULES in the backend (libs/config.ts).
 * The backend calculates the real totals; the frontend only previews them.
 */
export const ORDER_RULES = {
	MAX_CART_QUANTITY: 10,
	DELIVERY_FEE: 50,
	FREE_DELIVERY_FROM: 1000,
	PENDING_TTL_MINUTES: 30,
};

export const deliveryFeeFor = (subtotal: number): number =>
	subtotal >= ORDER_RULES.FREE_DELIVERY_FROM ? 0 : ORDER_RULES.DELIVERY_FEE;
