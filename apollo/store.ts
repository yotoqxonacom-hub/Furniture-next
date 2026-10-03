import { makeVar } from '@apollo/client';

import { CustomJwtPayload } from '../libs/types/customJwtPayload';
export const themeVar = makeVar({});

export const userVar = makeVar<CustomJwtPayload>({
	_id: '',
	memberType: '',
	memberStatus: '',
	memberAuthType: '',
	memberPhone: '',
	memberNick: '',
	memberFullName: '',
	memberImage: '',
	memberAddress: '',
	memberDesc: '',
	memberProducts: 0,
	memberRank: 0,
	memberArticles: 0,
	memberPoints: 0,
	memberLikes: 0,
	memberViews: 0,
	memberWarnings: 0,
	memberBlocks: 0,
});

/** live chat (see libs/socket.ts and libs/components/Chat.tsx) */
export interface ChatTarget {
	_id: string;
	memberNick: string;
	memberImage?: string;
	memberType?: string;
}
export interface PublicMessage {
	event: string;
	text: string;
	memberData: any;
	/** set by the server (older servers may not send them) */
	id?: string;
	createdAt?: string;
	/** someone other than the author has seen it */
	read?: boolean;
}
export interface SocketEvent {
	seq: number;
	payload: any;
}

export const socketStatusVar = makeVar<'connecting' | 'open' | 'closed'>('closed');
export const onlineUsersVar = makeVar<number>(0);
export const publicMessagesVar = makeVar<PublicMessage[]>([]);
/** last private-chat event (dm / read); seq changes on every event so effects re-run */
export const socketEventVar = makeVar<SocketEvent>({ seq: 0, payload: null });
export const chatOpenVar = makeVar<boolean>(false);
export const chatTabVar = makeVar<'inbox' | 'public'>('inbox');
export const chatTargetVar = makeVar<ChatTarget | null>(null);
export const unreadMessagesVar = makeVar<number>(0);

/** pieces in the cart (header badge); kept fresh by useCartCount / useCartActions */
export const cartCountVar = makeVar<number>(0);
