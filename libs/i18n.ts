import { i18n } from 'next-i18next';

/**
 * Translation for code that cannot use the useTranslation() hook
 * (plain modules like auth, upload, chat, sweetAlert).
 * Falls back to the key itself (English) before i18n is initialised or on the server.
 */
export const translate = (key: string): string => {
	if (!i18n?.isInitialized) return key;
	return i18n.t(key, { ns: 'common' });
};

/** next-i18next locale -> BCP 47 tag for Intl APIs ('kr' is our Korean route prefix) */
export const intlLocale = (locale?: string): string => {
	switch (locale ?? i18n?.language) {
		case 'kr':
			return 'ko';
		case 'uz':
			return 'uz';
		case 'ru':
			return 'ru';
		default:
			return 'en';
	}
};
