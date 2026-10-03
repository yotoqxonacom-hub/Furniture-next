export enum PaymentMethod {
	CARD = 'CARD',
	KAKAO_PAY = 'KAKAO_PAY',
	TOSS_PAY = 'TOSS_PAY',
	BANK_TRANSFER = 'BANK_TRANSFER',
}

export enum PaymentStatus {
	PAID = 'PAID',
	PARTIAL_REFUNDED = 'PARTIAL_REFUNDED',
	REFUNDED = 'REFUNDED',
}

export const paymentMethodLabel: Record<PaymentMethod, string> = {
	[PaymentMethod.CARD]: 'Card',
	[PaymentMethod.KAKAO_PAY]: 'Kakao Pay',
	[PaymentMethod.TOSS_PAY]: 'Toss Pay',
	[PaymentMethod.BANK_TRANSFER]: 'Bank transfer',
};
