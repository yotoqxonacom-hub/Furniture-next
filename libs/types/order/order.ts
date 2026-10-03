import { OrderStatus } from '../../enums/order.enum';
import { ProductLocation } from '../../enums/product.enum';
import { Member } from '../member/member';
import { TotalCounter } from '../product/product';

export interface ShippingAddress {
	recipientName: string;
	recipientPhone: string;
	city: ProductLocation;
	address: string;
	note?: string;
}

export interface OrderItem {
	_id: string;
	orderId: string;
	productId: string;
	itemQuantity: number;
	itemPrice: number;
	productTitle: string;
	productImage?: string;
	createdAt: Date;
}

export interface Order {
	_id: string;
	orderStatus: OrderStatus;
	orderSubtotal: number;
	orderDeliveryFee: number;
	orderTotal: number;
	shippingAddress: ShippingAddress;
	memberId: string;
	agentId: string;
	paymentId?: string;
	cancelReason?: string;
	paidAt?: Date;
	processedAt?: Date;
	shippedAt?: Date;
	deliveredAt?: Date;
	cancelledAt?: Date;
	createdAt: Date;
	updatedAt: Date;
	/** from aggregation */
	orderItems?: OrderItem[];
	memberData?: Member;
	agentData?: Member;
}

export interface Orders {
	list: Order[];
	metaCounter: TotalCounter[];
}
