import { getJwtToken } from './auth';
import { WS_URL } from './env';
import { onlineUsersVar, publicMessagesVar, socketEventVar, socketStatusVar } from '../apollo/store';

/**
 * One WebSocket per browser tab, shared by every page.
 * - authenticates with ?token=JWT (guests connect without a token)
 * - reconnects automatically with back-off
 * - turns server events into Apollo reactive vars
 */
const PUBLIC_HISTORY = 50;

let socket: WebSocket | null = null;
let retry = 0;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let manualClose = false;
let seq = 0;

export const socketBaseUrl = (): string => WS_URL;

const socketUrl = (): string => {
	const base = socketBaseUrl();
	const token = getJwtToken();
	return token ? `${base}?token=${encodeURIComponent(token)}` : base;
};

const handleMessage = (msg: MessageEvent) => {
	let data: any;
	try {
		data = JSON.parse(msg.data);
	} catch {
		return;
	}
	switch (data?.event) {
		case 'info':
			onlineUsersVar(data.totalClients ?? 0);
			break;
		case 'getMessages':
			publicMessagesVar((data.list ?? []).slice(-PUBLIC_HISTORY));
			break;
		case 'message':
			publicMessagesVar([...publicMessagesVar(), data].slice(-PUBLIC_HISTORY));
			break;
		case 'dm':
		case 'read':
			socketEventVar({ seq: ++seq, payload: data });
			break;
	}
};

const scheduleReconnect = () => {
	if (manualClose || reconnectTimer) return;
	const delay = Math.min(30000, 1000 * 2 ** retry);
	retry += 1;
	reconnectTimer = setTimeout(() => {
		reconnectTimer = null;
		connectSocket();
	}, delay);
};

export const connectSocket = () => {
	if (typeof window === 'undefined') return;
	if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) return;
	const url = socketUrl();

	manualClose = false;
	socketStatusVar('connecting');
	const ws = new WebSocket(url);
	socket = ws;

	ws.onopen = () => {
		retry = 0;
		socketStatusVar('open');
		console.log(`WebSocket connected: ${socketBaseUrl()} (${getJwtToken() ? 'member' : 'guest'})`);
	};
	ws.onmessage = handleMessage;
	ws.onerror = () => {
		/* onclose follows and schedules a reconnect */
	};
	ws.onclose = (event) => {
		if (socket === ws) socket = null;
		socketStatusVar('closed');
		console.log(`WebSocket closed (code ${event.code}), reconnecting…`);
		scheduleReconnect();
	};
};

/** call after login / logout so the server knows who this tab belongs to */
export const reconnectSocket = () => {
	manualClose = true;
	if (reconnectTimer) {
		clearTimeout(reconnectTimer);
		reconnectTimer = null;
	}
	const old = socket;
	socket = null;
	if (old) {
		// detach first so the old socket's close does not schedule another reconnect
		old.onclose = null;
		old.onmessage = null;
		old.close();
	}
	retry = 0;
	connectSocket();
};

/** public community chat message */
export const sendPublicMessage = (text: string): boolean => {
	if (!socket || socket.readyState !== WebSocket.OPEN) {
		connectSocket();
		return false;
	}
	socket.send(JSON.stringify({ event: 'message', data: text }));
	return true;
};
