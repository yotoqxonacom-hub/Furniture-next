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
			'Open a product and tap “Add to cart” or “Buy now”. Check your cart, go to Checkout, enter the delivery address and pay. You need to be logged in.',
	},
	{
		_id: 'faq-payment',
		noticeTitle: 'Which payment methods can I use?',
		noticeContent: 'Card, Kakao Pay, Toss Pay or bank transfer. You choose the method at checkout.',
	},
	{
		_id: 'faq-delivery-fee',
		noticeTitle: 'How much does delivery cost?',
		noticeContent:
			'Delivery is $50 per seller and free when your items from one seller cost $1,000 or more. The checkout shows the exact total before you pay.',
	},
	{
		_id: 'faq-sellers',
		noticeTitle: 'Why did my order split into several orders?',
		noticeContent:
			'Each seller ships their own items, so a cart with products from several sellers becomes one order per seller. Each order has its own delivery fee and status.',
	},
	{
		_id: 'faq-quantity',
		noticeTitle: 'How many pieces of one product can I order?',
		noticeContent: 'Up to 10 of the same product per order, and never more than the seller has in stock.',
	},
	{
		_id: 'faq-unpaid',
		noticeTitle: 'What happens if I do not pay right away?',
		noticeContent:
			'The order waits in My Page › My orders as “Awaiting payment”. You can pay it there, but unpaid orders are cancelled automatically after 30 minutes.',
	},
	{
		_id: 'faq-track',
		noticeTitle: 'How do I track my order?',
		noticeContent:
			'Open My Page › My orders. Every order goes through Awaiting payment → Paid → Preparing → Shipped → Delivered, and you get a notification when the seller moves it forward.',
	},
	{
		_id: 'faq-cancel',
		noticeTitle: 'Can I cancel an order?',
		noticeContent:
			'Yes, while it is “Awaiting payment” or “Paid”. Open the order and tap “Cancel order”: the stock goes back to the seller and a paid order is refunded. Once the seller starts preparing it, ask the seller in the chat.',
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
		_id: 'faq-seller-orders',
		noticeTitle: 'Where do sellers see and handle orders?',
		noticeContent:
			'In My Page › Customer orders. Move each paid order forward with “Start preparing”, “Mark as shipped” and “Mark as delivered”, or cancel it — the buyer is refunded.',
	},
	{
		_id: 'faq-message',
		noticeTitle: 'How do I message a seller or another member?',
		noticeContent: 'Open their page and tap “Message”. The private chat opens in the corner. You need to be logged in.',
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
