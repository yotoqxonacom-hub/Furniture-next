import { Member } from '../member/member';
import { TotalCounter } from '../product/product';

export type MessageStatus = 'SENT' | 'READ';

export interface Message {
	_id: string;
	conversationKey: string;
	senderId: string;
	receiverId: string;
	messageText: string;
	messageStatus: MessageStatus;
	createdAt: Date | string;
	updatedAt?: Date | string;
}

export interface Messages {
	list: Message[];
	metaCounter: TotalCounter[];
}

export interface Conversation {
	conversationKey: string;
	partnerId: string;
	partnerData?: Member;
	lastMessage: Message;
	unreadCount: number;
	partnerOnline: boolean;
}

export interface Conversations {
	list: Conversation[];
	totalUnread: number;
}
