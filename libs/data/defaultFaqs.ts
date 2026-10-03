/**
 * Built-in FAQ shown only while the backend has no FAQ entries
 * (Admin › CS › FAQ). As soon as an admin publishes one, the backend list is used instead.
 * Texts are translation keys: see public/locales/<locale>/common.json.
 */
export interface FaqItem {
	_id: string;
	noticeTitle: string;
	noticeContent: string;
}

export const DEFAULT_FAQS: FaqItem[] = [
	{
		_id: 'faq-buy',
		noticeTitle: 'How do I buy furniture here?',
		noticeContent:
			'Open a product and tap “Message seller” or “Call”. You agree on the price, delivery and payment directly with the seller.',
	},
	{
		_id: 'faq-delivery',
		noticeTitle: 'How long does delivery take?',
		noticeContent:
			'Each seller sets their own delivery time and cost, usually a few days within the same city. Ask the seller in the chat before you order.',
	},
	{
		_id: 'faq-returns',
		noticeTitle: 'Can I return a product?',
		noticeContent:
			'Return conditions depend on the seller. Agree on them in the chat before paying and keep the conversation as a record.',
	},
	{
		_id: 'faq-seller',
		noticeTitle: 'How do I become a seller?',
		noticeContent:
			'Sign up and choose “Seller” as the account type. Then use “Add product” in the Shop, on the Sellers page or in My Page.',
	},
	{
		_id: 'faq-add',
		noticeTitle: 'What do I need to add a product?',
		noticeContent:
			'A title, category, city, address, price, width in cm, number of seats and pieces, a description and up to 5 photos (JPG or PNG).',
	},
	{
		_id: 'faq-message',
		noticeTitle: 'How do I message a seller or another member?',
		noticeContent:
			'Open their page and tap “Message”. The private chat opens in the corner. You need to be logged in.',
	},
	{
		_id: 'faq-follow',
		noticeTitle: 'What does “Follow” do?',
		noticeContent:
			'Following a seller or member keeps them in your Followings list so you can find their new products and posts quickly.',
	},
	{
		_id: 'faq-barter',
		noticeTitle: 'What does “Open to barter” mean?',
		noticeContent: 'The seller is willing to exchange the item for another piece instead of, or together with, money.',
	},
	{
		_id: 'faq-report',
		noticeTitle: 'How do I report a product or a seller?',
		noticeContent:
			'Use “Report” on the product or seller page. You can follow the status of your reports in My Page › My reports.',
	},
	{
		_id: 'faq-language',
		noticeTitle: 'Which languages are available?',
		noticeContent: 'English, Korean, Uzbek and Russian. Change the language with the flag button in the header.',
	},
];
