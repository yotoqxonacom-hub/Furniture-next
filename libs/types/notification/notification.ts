import { OrderStatus } from '../../enums/order.enum';
import { NotificationGroup, NotificationStatus, NotificationType } from '../../enums/notification.enum';
import { Member } from '../member/member';
import { TotalCounter } from '../product/product';

export interface Notification {
	_id: string;
	notificationType: NotificationType;
	notificationStatus: NotificationStatus;
	notificationGroup: NotificationGroup;
	notificationTitle: string;
	notificationDesc?: string;
	authorId: string;
	receiverId: string;
	productId?: string;
	articleId?: string;
	orderId?: string;
	orderStatus?: OrderStatus;
	createdAt: Date;
	authorData?: Member;
	receiverData?: Member;
}

export interface Notifications {
	list: Notification[];
	metaCounter: TotalCounter[];
	unreadCount?: number;
}

export interface NotificationsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: string;
	search: {
		notificationStatus?: NotificationStatus;
	};
}

export interface AllNotificationsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: string;
	search: {
		notificationStatus?: NotificationStatus;
		notificationType?: NotificationType;
		notificationGroup?: NotificationGroup;
	};
}
