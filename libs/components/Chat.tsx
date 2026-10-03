import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useLazyQuery, useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import { Avatar, CircularProgress } from '@mui/material';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import DoneRoundedIcon from '@mui/icons-material/DoneRounded';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import ScrollableFeed from 'react-scrollable-feed';
import {
	chatOpenVar,
	chatTabVar,
	chatTargetVar,
	onlineUsersVar,
	publicMessagesVar,
	socketEventVar,
	socketStatusVar,
	unreadMessagesVar,
	userVar,
} from '../../apollo/store';
import { GET_CONVERSATIONS, GET_MESSAGES } from '../../apollo/user/query';
import { MARK_CONVERSATION_READ, SEND_MESSAGE } from '../../apollo/user/mutation';
import { Conversation, Message } from '../types/message/message';
import { T } from '../types/common';
import { markPublicRead, sendPublicMessage } from '../socket';
import { sweetErrorAlert } from '../sweetAlert';
import { memberImageUrl } from '../utils';

const PAGE_SIZE = 30;

/** one tick: delivered, not read yet · two ticks: the other side has read it */
const ReadTicks = ({ read }: { read: boolean }) => {
	const { t } = useTranslation('common');
	return (
		<span className={`ticks ${read ? 'read' : ''}`} title={read ? t('Read') : t('Sent')} aria-label={read ? t('Read') : t('Sent')}>
			{read ? <DoneAllRoundedIcon /> : <DoneRoundedIcon />}
		</span>
	);
};

const shortTime = (date?: Date | string) => {
	if (!date) return '';
	const d = new Date(date);
	const now = new Date();
	if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

/* ------------------------------------------------------------------ */
/* Conversation list                                                   */
/* ------------------------------------------------------------------ */

interface InboxProps {
	conversations: Conversation[];
	loading: boolean;
	myId: string;
}

const Inbox = ({ conversations, loading, myId }: InboxProps) => {
	const { t } = useTranslation('common');

	if (loading && !conversations.length) {
		return (
			<div className={'chat-empty'}>
				<CircularProgress size={24} />
			</div>
		);
	}

	if (!conversations.length) {
		return (
			<div className={'chat-empty'}>
				<ChatBubbleOutlineRoundedIcon />
				<strong>{t('No conversations yet')}</strong>
				<span>{t('Open a seller or member page and tap “Message” to start chatting.')}</span>
			</div>
		);
	}

	return (
		<div className={'conv-list'}>
			{conversations.map((conv) => {
				const partner = conv.partnerData;
				const mine = conv.lastMessage?.senderId === myId;
				return (
					<button
						key={conv.conversationKey}
						className={`conv-item ${conv.unreadCount > 0 ? 'unread' : ''}`}
						onClick={() =>
							chatTargetVar({
								_id: conv.partnerId,
								memberNick: partner?.memberNick ?? t('Deleted member'),
								memberImage: partner?.memberImage,
								memberType: partner?.memberType,
							})
						}
					>
						<span className={'avatar-wrap'}>
							<img src={memberImageUrl(partner?.memberImage)} alt="" />
							{conv.partnerOnline && <span className={'online-dot'} />}
						</span>
						<span className={'conv-text'}>
							<span className={'row'}>
								<strong>{partner?.memberFullName || partner?.memberNick || t('Deleted member')}</strong>
								<small>{shortTime(conv.lastMessage?.createdAt)}</small>
							</span>
							<span className={'row'}>
								<span className={'preview'}>
									{mine ? `${t('You')}: ` : ''}
									{conv.lastMessage?.messageText}
								</span>
								{conv.unreadCount > 0 && <span className={'count'}>{conv.unreadCount}</span>}
							</span>
						</span>
					</button>
				);
			})}
		</div>
	);
};

/* ------------------------------------------------------------------ */
/* One conversation                                                    */
/* ------------------------------------------------------------------ */

interface ThreadProps {
	myId: string;
	onChanged: () => void;
}

const Thread = ({ myId, onChanged }: ThreadProps) => {
	const router = useRouter();
	const { t } = useTranslation('common');
	const target = useReactiveVar(chatTargetVar)!;
	const socketEvent = useReactiveVar(socketEventVar);
	const [messages, setMessages] = useState<Message[]>([]);
	const [page, setPage] = useState<number>(1);
	const [total, setTotal] = useState<number>(0);
	const [text, setText] = useState<string>('');
	const [sending, setSending] = useState<boolean>(false);
	const lastSeq = useRef<number>(socketEvent.seq);

	/** APOLLO REQUESTS **/
	const [sendMessage] = useMutation(SEND_MESSAGE);
	const [markRead] = useMutation(MARK_CONVERSATION_READ);
	const [loadMessages, { loading }] = useLazyQuery(GET_MESSAGES, { fetchPolicy: 'network-only' });

	const markReadHandler = async () => {
		try {
			const res = await markRead({ variables: { input: target._id } });
			if (res?.data?.markConversationRead) onChanged();
		} catch (err) {
			/* not critical */
		}
	};

	const fetchPage = async (nextPage: number) => {
		const res = await loadMessages({
			variables: { input: { partnerId: target._id, page: nextPage, limit: PAGE_SIZE } },
		});
		const list: Message[] = [...(res?.data?.getMessages?.list ?? [])].reverse(); // oldest first
		setTotal(res?.data?.getMessages?.metaCounter?.[0]?.total ?? 0);
		setMessages((prev) => (nextPage === 1 ? list : [...list, ...prev]));
		setPage(nextPage);
	};

	/** LIFECYCLES **/
	useEffect(() => {
		setMessages([]);
		setText('');
		fetchPage(1).then(markReadHandler);
	}, [target._id]);

	// live events from the socket
	useEffect(() => {
		if (socketEvent.seq === lastSeq.current) return;
		lastSeq.current = socketEvent.seq;
		const payload = socketEvent.payload;
		if (!payload) return;

		if (payload.event === 'dm') {
			const msg: Message = payload.message;
			const belongsHere =
				(msg.senderId === target._id && msg.receiverId === myId) ||
				(msg.senderId === myId && msg.receiverId === target._id);
			if (!belongsHere) return;
			setMessages((prev) => (prev.some((m) => m._id === msg._id) ? prev : [...prev, msg]));
			setTotal((prev) => prev + 1);
			if (msg.senderId === target._id) markReadHandler();
		}

		if (payload.event === 'read' && payload.readerId === target._id) {
			setMessages((prev) => prev.map((m) => (m.senderId === myId ? { ...m, messageStatus: 'READ' } : m)));
		}
	}, [socketEvent.seq]);

	/** HANDLERS **/
	const sendHandler = async (e?: React.FormEvent) => {
		e?.preventDefault();
		const value = text.trim();
		if (!value || sending) return;
		try {
			setSending(true);
			const res = await sendMessage({ variables: { input: { receiverId: target._id, messageText: value } } });
			const msg: Message | undefined = res?.data?.sendMessage;
			if (msg) setMessages((prev) => (prev.some((m) => m._id === msg._id) ? prev : [...prev, msg]));
			setText('');
			onChanged();
		} catch (err: any) {
			sweetErrorAlert(err.message).then();
		} finally {
			setSending(false);
		}
	};

	const openProfile = async () => {
		chatOpenVar(false);
		if (target.memberType === 'AGENT') await router.push({ pathname: '/agent/detail', query: { agentId: target._id } });
		else await router.push({ pathname: '/member', query: { memberId: target._id } });
	};

	return (
		<div className={'thread'}>
			<div className={'thread-head'}>
				<button className={'icon'} onClick={() => chatTargetVar(null)} aria-label={'Back'}>
					<ArrowBackRoundedIcon />
				</button>
				<button className={'who'} onClick={openProfile}>
					<img src={memberImageUrl(target.memberImage)} alt="" />
					<span>
						<strong>{target.memberNick}</strong>
						<small>{target.memberType === 'AGENT' ? t('Seller') : t('Member')}</small>
					</span>
				</button>
			</div>

			<div className={'thread-body'}>
				<ScrollableFeed>
					<div className={'thread-list'}>
						{messages.length < total && (
							<button className={'load-older'} onClick={() => fetchPage(page + 1)} disabled={loading}>
								{loading ? t('Loading…') : t('Load earlier messages')}
							</button>
						)}
						{!loading && messages.length === 0 && (
							<div className={'thread-hint'}>
								{t('Say hello to')} {target.memberNick} 👋
								<br />
								{t('Ask about size, delivery or price — sellers usually reply quickly.')}
							</div>
						)}
						{messages.map((msg) => {
							const mine = msg.senderId === myId;
							return (
								<div key={msg._id} className={`bubble-row ${mine ? 'mine' : ''}`}>
									<div className={'bubble'}>
										<p>{msg.messageText}</p>
										<span className={'meta'}>
											<small>{shortTime(msg.createdAt)}</small>
											{mine && <ReadTicks read={msg.messageStatus === 'READ'} />}
										</span>
									</div>
								</div>
							);
						})}
					</div>
				</ScrollableFeed>
			</div>

			<form className={'chat-bott'} onSubmit={sendHandler}>
				<input
					className={'msg-input'}
					value={text}
					maxLength={1000}
					onChange={(e) => setText(e.target.value)}
					placeholder={t('Write a message…')}
					autoFocus
				/>
				<button type="submit" className={'send-msg-btn'} disabled={!text.trim() || sending} aria-label={'Send'}>
					<SendRoundedIcon />
				</button>
			</form>
		</div>
	);
};

/* ------------------------------------------------------------------ */
/* Public community chat                                               */
/* ------------------------------------------------------------------ */

const PublicChat = ({ myId }: { myId?: string }) => {
	const { t } = useTranslation('common');
	const messages = useReactiveVar(publicMessagesVar);
	const status = useReactiveVar(socketStatusVar);
	const open = useReactiveVar(chatOpenVar);
	const [text, setText] = useState<string>('');

	/** LIFECYCLES **/
	// the community tab is on screen: tell the server we have read other people's messages
	useEffect(() => {
		const report = () => {
			if (!open || document.visibilityState !== 'visible') return;
			const unread = messages.filter((m) => m.id && !m.read && !(myId && m.memberData?._id === myId)).map((m) => m.id!);
			if (unread.length) markPublicRead(unread);
		};
		report();
		document.addEventListener('visibilitychange', report);
		return () => document.removeEventListener('visibilitychange', report);
	}, [messages, open, myId]);

	const sendHandler = (e: React.FormEvent) => {
		e.preventDefault();
		const value = text.trim();
		if (!value) return;
		if (!sendPublicMessage(value)) {
			sweetErrorAlert(t('Chat is reconnecting, please try again')).then();
			return;
		}
		setText('');
	};

	return (
		<div className={'thread'}>
			<div className={'thread-body'}>
				<ScrollableFeed>
					<div className={'thread-list'}>
						<div className={'thread-hint'}>{t('Community chat — everyone online can see these messages.')}</div>
						{messages.map((msg, index) => {
							const mine = Boolean(myId) && msg.memberData?._id === myId;
							return (
								<div key={msg.id ?? index} className={`bubble-row ${mine ? 'mine' : ''}`}>
									{!mine && (
										<Avatar
											alt={msg.memberData?.memberNick ?? 'Guest'}
											src={memberImageUrl(msg.memberData?.memberImage)}
											sx={{ width: 28, height: 28 }}
										/>
									)}
									<div className={'bubble'}>
										{!mine && <span className={'author'}>{msg.memberData?.memberNick ?? t('Guest')}</span>}
										<p>{msg.text}</p>
										<span className={'meta'}>
											{msg.createdAt && <small>{shortTime(msg.createdAt)}</small>}
											{mine && <ReadTicks read={Boolean(msg.read)} />}
										</span>
									</div>
								</div>
							);
						})}
					</div>
				</ScrollableFeed>
			</div>
			<form className={'chat-bott'} onSubmit={sendHandler}>
				<input
					className={'msg-input'}
					value={text}
					maxLength={500}
					onChange={(e) => setText(e.target.value)}
					placeholder={status === 'open' ? t('Message everyone…') : t('Connecting…')}
				/>
				<button type="submit" className={'send-msg-btn'} disabled={!text.trim()} aria-label={'Send'}>
					<SendRoundedIcon />
				</button>
			</form>
		</div>
	);
};

/* ------------------------------------------------------------------ */
/* Widget                                                              */
/* ------------------------------------------------------------------ */

const Chat = () => {
	const router = useRouter();
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const open = useReactiveVar(chatOpenVar);
	const tab = useReactiveVar(chatTabVar);
	const target = useReactiveVar(chatTargetVar);
	const unread = useReactiveVar(unreadMessagesVar);
	const onlineUsers = useReactiveVar(onlineUsersVar);
	const socketEvent = useReactiveVar(socketEventVar);
	const [conversations, setConversations] = useState<Conversation[]>([]);
	const chatRef = useRef<HTMLDivElement>(null);

	/** APOLLO REQUESTS **/
	const { loading, refetch: refetchConversations } = useQuery(GET_CONVERSATIONS, {
		fetchPolicy: 'network-only',
		context: { silent: true }, // background badge — never pop an alert
		skip: !user?._id,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setConversations(data?.getConversations?.list ?? []);
			unreadMessagesVar(data?.getConversations?.totalUnread ?? 0);
		},
	});

	const reloadConversations = () => {
		if (user?._id) refetchConversations().then();
	};

	/** LIFECYCLES **/
	// new message or read receipt anywhere -> refresh list and unread badge
	useEffect(() => {
		if (socketEvent.seq) reloadConversations();
	}, [socketEvent.seq]);

	useEffect(() => {
		if (open && tab === 'inbox' && !target) reloadConversations();
	}, [open, tab, target]);

	useEffect(() => {
		if (!user?._id) unreadMessagesVar(0);
	}, [user?._id]);

	// open chat closes on a click / tap anywhere outside it, or with Escape
	useEffect(() => {
		if (!open) return;
		const onPointerDown = (e: PointerEvent) => {
			const node = e.target as Element | null;
			if (!node || chatRef.current?.contains(node)) return;
			// alerts and menus opened from the chat live outside it in the DOM
			if (node.closest('.swal2-container, .MuiPopover-root, .MuiModal-root')) return;
			chatOpenVar(false);
		};
		const onKeyDown = (e: KeyboardEvent) => e.key === 'Escape' && chatOpenVar(false);
		document.addEventListener('pointerdown', onPointerDown);
		document.addEventListener('keydown', onKeyDown);
		return () => {
			document.removeEventListener('pointerdown', onPointerDown);
			document.removeEventListener('keydown', onKeyDown);
		};
	}, [open]);

	// forms with a sticky submit bar: keep the corner free unless the chat is open
	const formPage = router.pathname === '/mypage' && ['addProduct', 'writeArticle'].includes(router.query?.category as string);
	if (formPage && !open) return null;

	const myId = user?._id ?? '';

	return (
		<div className="chatting" ref={chatRef}>
			<button className="chat-button" onClick={() => chatOpenVar(!open)} aria-label={'Messages'}>
				{open ? <CloseRoundedIcon /> : <ChatBubbleOutlineRoundedIcon />}
				{!open && unread > 0 && <span className={'chat-badge'}>{unread > 9 ? '9+' : unread}</span>}
			</button>

			<div className={`chat-frame ${open ? 'open' : ''}`}>
				<div className={'chat-top'}>
					<div className={'chat-tabs'}>
						<button className={tab === 'inbox' ? 'active' : ''} onClick={() => chatTabVar('inbox')}>
							{t('Messages')}
							{unread > 0 && <span className={'count'}>{unread}</span>}
						</button>
						<button className={tab === 'public' ? 'active' : ''} onClick={() => chatTabVar('public')}>
							{t('Community')}
							<span className={'online'}>{onlineUsers}</span>
						</button>
					</div>
					<button className={'icon'} onClick={() => chatOpenVar(false)} aria-label={'Close chat'}>
						<CloseRoundedIcon />
					</button>
				</div>

				<div className={'chat-content'}>
					{tab === 'public' ? (
						<PublicChat myId={myId} />
					) : !user?._id ? (
						<div className={'chat-empty'}>
							<ChatBubbleOutlineRoundedIcon />
							<strong>{t('Login to message sellers')}</strong>
							<span>{t('Ask about size, delivery or price directly in the chat.')}</span>
							<button
								className={'fx-btn primary sm'}
								onClick={() => {
									chatOpenVar(false);
									router.push('/account/join').then();
								}}
							>
								{t('Login')}
							</button>
						</div>
					) : target ? (
						<Thread myId={myId} onChanged={reloadConversations} />
					) : (
						<Inbox conversations={conversations} loading={loading} myId={myId} />
					)}
				</div>
			</div>
		</div>
	);
};

export default Chat;
