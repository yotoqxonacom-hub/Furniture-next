/**
 * Collects every translation key used by the app and checks the locale files.
 *
 *   node scripts/i18n-keys.js          -> report missing keys per locale (exit 1 if any)
 *   node scripts/i18n-keys.js --list   -> print all keys as JSON
 *
 * A key is:
 *  - any string literal inside t( ... ) or translate( ... )   e.g. t('Shop'), t(n === 1 ? 'product' : 'products')
 *  - TEXT_PROPS values of objects, e.g. { label: 'Free board' } in config.ts (rendered later as t(item.label))
 *  - TEXT_PROPS values passed as JSX props, e.g. <ProductSection title={'Top picks'} /> (the component calls t(title))
 *  - values of *Label maps (productTypeLabel, orderStatusLabel, sellerActionLabel, ...)
 *  - EXTRA_KEYS below: values produced at runtime (capitalize(status), city names)
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SCAN_DIRS = ['pages', 'libs'];
const SKIP = [path.join('pages', '_admin'), path.join('libs', 'components', 'admin')];
const LOCALES = ['en', 'kr', 'uz', 'ru'];

const EXTRA_KEYS = [
	// product / article statuses rendered with t(capitalize(value))
	'FAQ', 'Active', 'Sold', 'Delete', 'Free', 'Recommend', 'News', 'Interior',
	// cities rendered with t(capitalize(location))
	'Seoul', 'Busan', 'Incheon', 'Daegu', 'Gyeongju', 'Gwangju', 'Chonju', 'Daejon', 'Jeju',
	// notification actions built in Top.tsx (notificationAction)
	'liked your product', 'commented on your product', 'liked your article', 'commented on your article',
	'liked your profile', 'left a review on your profile',
	// order notification actions (Top.tsx ORDER_ACTIONS)
	'created an order', 'placed a new order', 'is preparing your order', 'shipped your order',
	'marked your order as delivered', 'cancelled the order',
	// order timeline steps (OrderTimeline STEP_LABEL)
	'Order placed', 'Paid', 'Preparing', 'Shipped', 'Delivered', 'Cancelled',
	// checkout validation field names (addressErrors) and success texts passed to run() in cart / order hooks
	'Recipient name', 'Phone', 'City', 'Address',
	'Added to cart', 'Removed from cart', 'Order cancelled', 'Payment completed', 'Updated',
];

/** object keys / JSX props whose string values are rendered through t() somewhere */
const TEXT_PROPS = 'label|title|desc|note|eyebrow|subtitle|noticeTitle|noticeContent'; // notice* = built-in FAQ (libs/data)
const OBJECT_TEXT = new RegExp(`\\b(?:${TEXT_PROPS}):\\s*'((?:[^'\\\\]|\\\\.)*)'`, 'g');
const JSX_TEXT = new RegExp(`\\s(?:${TEXT_PROPS})=\\{?(?:'((?:[^'\\\\]|\\\\.)*)'|"([^"]*)")`, 'g');

const walk = (dir, out = []) => {
	for (const name of fs.readdirSync(dir)) {
		const full = path.join(dir, name);
		const rel = path.relative(ROOT, full);
		if (SKIP.some((s) => rel.startsWith(s))) continue;
		if (fs.statSync(full).isDirectory()) walk(full, out);
		else if (/\.(tsx?|js)$/.test(name)) out.push(full);
	}
	return out;
};

/** returns the text between t( and its matching ) */
const tCallArgs = (src) => {
	const args = [];
	const re = /(?<![.\w])(?:t|translate)\(/g; // skip i18n.t(key, ...) — key is a variable there
	let m;
	while ((m = re.exec(src))) {
		let depth = 1;
		let i = re.lastIndex;
		let quote = null;
		for (; i < src.length && depth > 0; i++) {
			const c = src[i];
			if (quote) {
				if (c === '\\') i++;
				else if (c === quote) quote = null;
				continue;
			}
			if (c === "'" || c === '"' || c === '`') quote = c;
			else if (c === '(') depth++;
			else if (c === ')') depth--;
		}
		args.push(src.slice(re.lastIndex, i - 1));
	}
	return args;
};

const strings = (code) => [...code.matchAll(/'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"/g)].map((m) => (m[1] ?? m[2]).replace(/\\'/g, "'"));

const collectKeys = () => {
	const keys = new Set(EXTRA_KEYS);
	for (const file of SCAN_DIRS.flatMap((d) => walk(path.join(ROOT, d)))) {
		const src = fs.readFileSync(file, 'utf8');
		tCallArgs(src).forEach((arg) => strings(arg).forEach((s) => s.trim() && keys.add(s)));
		for (const m of src.matchAll(OBJECT_TEXT)) keys.add(m[1].replace(/\\'/g, "'"));
		for (const m of src.matchAll(JSX_TEXT)) keys.add((m[1] ?? m[2]).replace(/\\'/g, "'"));
		for (const block of src.matchAll(/Label: [^=\n]*= \{([\s\S]*?)\};/g)) {
			strings(block[1]).forEach((s) => keys.add(s));
		}
	}
	// i18n keys must be plain text, drop code-ish strings that slipped in
	const isCodeLike = (k) => /^[A-Z_]+$/.test(k) || k.startsWith('/') || (k.includes('{') && !k.includes('{{'));
	return [...keys].filter((k) => k.trim() && (EXTRA_KEYS.includes(k) || !isCodeLike(k))).sort();
};

const keys = collectKeys();

if (process.argv.includes('--list')) {
	console.log(JSON.stringify(keys, null, 2));
	process.exit(0);
}

let missingTotal = 0;
for (const locale of LOCALES) {
	const file = path.join(ROOT, 'public', 'locales', locale, 'common.json');
	const dict = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
	const missing = keys.filter((k) => !(k in dict) || !String(dict[k]).trim());
	missingTotal += missing.length;
	console.log(`${locale}: ${keys.length - missing.length}/${keys.length} keys translated`);
	missing.slice(0, 30).forEach((k) => console.log(`   missing: ${k}`));
}
process.exit(missingTotal ? 1 : 0);
