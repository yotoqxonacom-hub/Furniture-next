import { OrderStatus } from '../../enums/order.enum';
import { Direction } from '../../enums/common.enum';
import { ShippingAddress } from './order';

export interface OrderInput {
	shippingAddress: ShippingAddress;
	/** checkout only these cart products; missing = whole cart */
	productIds?: string[];
}

export interface OrderStatusInput {
	orderId: string;
	orderStatus: OrderStatus;
	cancelReason?: string;
}

export interface OrdersInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: { orderStatus?: OrderStatus };
}

export interface AllOrdersInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: { orderStatus?: OrderStatus; agentId?: string; memberId?: string };
}
