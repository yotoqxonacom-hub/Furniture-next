import { ProductLocation, ProductStatus, ProductType } from '../../enums/product.enum';

export interface ProductUpdate {
	_id: string;
	productType?: ProductType;
	productStatus?: ProductStatus;
	productLocation?: ProductLocation;
	productAddress?: string;
	productTitle?: string;
	productPrice?: number;
	productSquare?: number;
	productBeds?: number;
	productRooms?: number;
	productStock?: number;
	productImages?: string[];
	productDesc?: string;
	productBarter?: boolean;
	soldAt?: Date;
	deletedAt?: Date;
	constructedAt?: Date;
}
