export enum OrderStatus {
	PENDING = 'PENDING',
	PAID = 'PAID',
	PROCESSING = 'PROCESSING',
	SHIPPED = 'SHIPPED',
	DELIVERED = 'DELIVERED',
	CANCELLED = 'CANCELLED',
}

/** same rules as the backend (libs/enums/order.enum.ts there) */
export const ORDER_STATUS_FLOW: Record<OrderStatus, OrderStatus[]> = {
	[OrderStatus.PENDING]: [OrderStatus.CANCELLED],
	[OrderStatus.PAID]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
	[OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
	[OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
	[OrderStatus.DELIVERED]: [],
	[OrderStatus.CANCELLED]: [],
};

export const BUYER_CANCELLABLE: OrderStatus[] = [OrderStatus.PENDING, OrderStatus.PAID];

/** progress steps shown in the order timeline */
export const ORDER_STEPS: OrderStatus[] = [
	OrderStatus.PENDING,
	OrderStatus.PAID,
	OrderStatus.PROCESSING,
	OrderStatus.SHIPPED,
	OrderStatus.DELIVERED,
];

export const orderStatusLabel: Record<OrderStatus, string> = {
	[OrderStatus.PENDING]: 'Awaiting payment',
	[OrderStatus.PAID]: 'Paid',
	[OrderStatus.PROCESSING]: 'Preparing',
	[OrderStatus.SHIPPED]: 'Shipped',
	[OrderStatus.DELIVERED]: 'Delivered',
	[OrderStatus.CANCELLED]: 'Cancelled',
};

/** fx-badge colour per status */
export const orderStatusTone: Record<OrderStatus, string> = {
	[OrderStatus.PENDING]: 'pending',
	[OrderStatus.PAID]: 'clay',
	[OrderStatus.PROCESSING]: 'clay',
	[OrderStatus.SHIPPED]: 'sage',
	[OrderStatus.DELIVERED]: 'sage',
	[OrderStatus.CANCELLED]: 'danger',
};

/** button text for the seller's next step */
export const sellerActionLabel: Partial<Record<OrderStatus, string>> = {
	[OrderStatus.PROCESSING]: 'Start preparing',
	[OrderStatus.SHIPPED]: 'Mark as shipped',
	[OrderStatus.DELIVERED]: 'Mark as delivered',
};
