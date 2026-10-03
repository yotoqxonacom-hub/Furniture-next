import { Product } from '../product/product';

export interface CartItem {
	_id: string;
	memberId: string;
	productId: string;
	quantity: number;
	createdAt: Date;
	updatedAt: Date;
	/** from aggregation; productData.memberData is the seller */
	productData?: Product;
}

export interface Cart {
	list: CartItem[];
	totalQuantity: number;
	subtotal: number;
	deliveryFee: number;
	total: number;
}

export interface CartItemInput {
	productId: string;
	quantity: number;
}
