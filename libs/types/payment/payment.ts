import { PaymentMethod, PaymentStatus } from '../../enums/payment.enum';

export interface Payment {
	_id: string;
	paymentMethod: PaymentMethod;
	paymentStatus: PaymentStatus;
	paymentAmount: number;
	refundedAmount: number;
	transactionKey: string;
	memberId: string;
	orderIds: string[];
	paidAt?: Date;
	refundedAt?: Date;
	createdAt: Date;
}

export interface PaymentInput {
	orderIds: string[];
	paymentMethod: PaymentMethod;
}
