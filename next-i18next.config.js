/**
 * Languages: English (default, no URL prefix), Korean (/kr), Uzbek (/uz), Russian (/ru).
 * Translations live in public/locales/<locale>/common.json.
 * Check coverage with: node scripts/i18n-keys.js
 */
module.exports = {
	i18n: {
		defaultLocale: 'en',
		locales: ['en', 'kr', 'uz', 'ru'],
		localeDetection: false,
	},
	trailingSlash: true,
	/*
	 * Our keys are the English sentences themselves ("Price: low to high", "Report sent. Our team…").
	 * i18next would otherwise treat ':' as a namespace separator and '.' as a nested-key separator,
	 * which splits such keys and causes wrong text + hydration errors. Keys are flat, so turn both off.
	 */
	nsSeparator: false,
	keySeparator: false,
};
