import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { Drawer, Menu, MenuItem, Popover, Divider } from '@mui/material';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import ChairOutlinedIcon from '@mui/icons-material/ChairOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import CartButton from './common/CartButton';
import { ADD_PRODUCT_HREF, isAdmin, isAgent, MY_ORDERS_HREF } from '../member';
import { OrderStatus } from '../enums/order.enum';
import { userVar } from '../../apollo/store';
import { getJwtToken, logOut, updateUserInfo } from '../auth';
import { GET_MY_NOTIFICATIONS } from '../../apollo/user/query';
import { READ_ALL_NOTIFICATIONS, READ_NOTIFICATION } from '../../apollo/user/mutation';
import { Notification } from '../types/notification/notification';
import { NotificationStatus } from '../enums/notification.enum';
import { memberImageUrl, timeAgo } from '../utils';
import { T } from '../types/common';

const navLinks = [
	{ href: '/', label: 'Home', icon: <HomeOutlinedIcon /> },
	{ href: '/product', label: 'Shop', icon: <ChairOutlinedIcon /> },
	{ href: '/agent', label: 'Sellers', icon: <StorefrontOutlinedIcon /> },
	{ href: '/community?articleCategory=FREE', label: 'Community', icon: <ForumOutlinedIcon /> },
	{ href: '/cs', label: 'Help', icon: <SupportAgentOutlinedIcon /> },
];

const languages = [
	{ id: 'en', label: 'English' },
	{ id: 'kr', label: 'Korean' },
	{ id: 'uz', label: 'Uzbek' },
	{ id: 'ru', label: 'Russian' },
];

const ORDER_ACTIONS: Record<OrderStatus, string> = {
	[OrderStatus.PENDING]: 'created an order',
	[OrderStatus.PAID]: 'placed a new order',
	[OrderStatus.PROCESSING]: 'is preparing your order',
	[OrderStatus.SHIPPED]: 'shipped your order',
	[OrderStatus.DELIVERED]: 'marked your order as delivered',
	[OrderStatus.CANCELLED]: 'cancelled the order',
};

/** backend stores an English title; we rebuild it from type + target so it can be translated */
const notificationAction = (notification: Notification): string => {
	if (notification.notificationGroup === 'ORDER') return ORDER_ACTIONS[notification.orderStatus ?? OrderStatus.PAID];
	const liked = notification.notificationType === 'LIKE';
	switch (notification.notificationGroup) {
		case 'PRODUCT':
			return liked ? 'liked your product' : 'commented on your product';
		case 'ARTICLE':
			return liked ? 'liked your article' : 'commented on your article';
		default:
			return liked ? 'liked your profile' : 'left a review on your profile';
	}
};

const Top = () => {
	const user = useReactiveVar(userVar);
	const { t } = useTranslation('common');
	const router = useRouter();
	const [lang, setLang] = useState<string>('en');
	const [scrolled, setScrolled] = useState<boolean>(false);
	const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
	const [langAnchor, setLangAnchor] = useState<null | HTMLElement>(null);
	const [userAnchor, setUserAnchor] = useState<null | HTMLElement>(null);
	const [notifAnchor, setNotifAnchor] = useState<null | HTMLElement>(null);
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [unreadCount, setUnreadCount] = useState<number>(0);

	/** APOLLO REQUESTS **/
	const { refetch: notificationsRefetch } = useQuery(GET_MY_NOTIFICATIONS, {
		fetchPolicy: 'network-only',
		context: { silent: true }, // background badge — never pop an alert
		variables: { input: { page: 1, limit: 10, search: {} } },
		skip: !user?._id,
		pollInterval: 60000,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setNotifications(data?.getMyNotifications?.list ?? []);
			setUnreadCount(data?.getMyNotifications?.unreadCount ?? 0);
		},
	});
	const [readNotification] = useMutation(READ_NOTIFICATION);
	const [readAllNotifications] = useMutation(READ_ALL_NOTIFICATIONS);

	/** LIFECYCLES **/
	useEffect(() => {
		// the URL decides the language (/kr/..., /uz/..., /ru/...); localStorage only remembers the last choice
		const current = router.locale ?? 'en';
		setLang(current);
		const stored = localStorage.getItem('locale');
		const remembered = languages.some((l) => l.id === stored) ? stored : null;
		if (remembered && remembered !== current && current === router.defaultLocale) {
			router.replace(router.asPath, router.asPath, { locale: remembered }).then();
		}
	}, [router.locale]);

	useEffect(() => {
		const jwt = getJwtToken();
		if (jwt) updateUserInfo(jwt);
	}, []);

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 10);
		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	}, []);

	useEffect(() => {
		setDrawerOpen(false);
	}, [router.asPath]);

	/** HANDLERS **/
	const isActive = (href: string) => {
		const path = href.split('?')[0];
		if (path === '/') return router.pathname === '/';
		return router.pathname.startsWith(path);
	};

	const langChoice = useCallback(
		async (id: string) => {
			setLang(id);
			localStorage.setItem('locale', id);
			setLangAnchor(null);
			await router.push(router.asPath, router.asPath, { locale: id });
		},
		[router],
	);

	const openNotificationHandler = async (notification: Notification) => {
		try {
			if (notification.notificationStatus === NotificationStatus.WAIT) {
				await readNotification({ variables: { input: notification._id } });
				await notificationsRefetch();
			}
			setNotifAnchor(null);
			if (notification.orderId) await router.push({ pathname: '/order/detail', query: { orderId: notification.orderId } });
			else if (notification.productId) await router.push({ pathname: '/product/detail', query: { id: notification.productId } });
			else if (notification.articleId)
				await router.push({ pathname: '/community/detail', query: { id: notification.articleId } });
			else await router.push('/mypage?category=myProfile');
		} catch (err: any) {
			console.log('ERROR, openNotificationHandler:', err.message);
		}
	};

	const readAllHandler = async () => {
		try {
			await readAllNotifications();
			await notificationsRefetch();
		} catch (err: any) {
			console.log('ERROR, readAllHandler:', err.message);
		}
	};

	const currentLang = languages.find((l) => l.id === lang) ?? languages[0];

	return (
		<>
			<header className={`fx-header ${scrolled ? 'scrolled' : ''}`}>
				<div className={'fx-container'}>
					<Link href={'/'} className={'logo'} aria-label={'Furniture home'}>
						<img src="/img/furniture/logo.svg" alt="Furniture" />
					</Link>

					<nav className={'nav'}>
						{navLinks.map((link) => (
							<Link key={link.href} href={link.href} className={isActive(link.href) ? 'active' : ''}>
								{t(link.label)}
							</Link>
						))}
						{user?._id && (
							<Link href={'/mypage'} className={isActive('/mypage') ? 'active' : ''}>
								{t('My Page')}
							</Link>
						)}
					</nav>

					<div className={'actions'}>
						<button className={'lang-btn'} onClick={(e) => setLangAnchor(e.currentTarget)} aria-label={'Language'}>
							<img src={`/img/flag/lang${lang}.png`} alt={currentLang.label} />
							{lang}
						</button>

						{user?._id ? (
							<>
								<button
									className={'fx-icon-btn notif-btn'}
									onClick={(e) => {
										setNotifAnchor(e.currentTarget);
										notificationsRefetch().then();
									}}
									aria-label={'Notifications'}
								>
									<NotificationsNoneRoundedIcon />
									{unreadCount > 0 && <span className={'dot'}>{unreadCount > 9 ? '9+' : unreadCount}</span>}
								</button>
								{!isAdmin(user) && <CartButton />}
								<button className={'avatar-btn'} onClick={(e) => setUserAnchor(e.currentTarget)} aria-label={'Account'}>
									<img src={memberImageUrl(user?.memberImage)} alt={user?.memberNick} />
								</button>
							</>
						) : (
							<Link href={'/account/join'} className={'fx-btn dark sm login-link'}>
								{t('Login')} / {t('Register')}
							</Link>
						)}

						<button className={'fx-icon-btn burger'} onClick={() => setDrawerOpen(true)} aria-label={'Open menu'}>
							<MenuRoundedIcon />
						</button>
					</div>
				</div>
			</header>

			{/* language menu */}
			<Menu
				anchorEl={langAnchor}
				open={Boolean(langAnchor)}
				onClose={() => setLangAnchor(null)}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
				transformOrigin={{ vertical: 'top', horizontal: 'right' }}
				sx={{ mt: '8px' }}
			>
				{languages.map((l) => (
					<MenuItem key={l.id} onClick={() => langChoice(l.id)} selected={l.id === lang} sx={{ gap: '10px' }}>
						<img src={`/img/flag/lang${l.id}.png`} alt={l.label} style={{ width: 22, height: 22, borderRadius: '50%' }} />
						{t(l.label)}
					</MenuItem>
				))}
			</Menu>

			{/* user menu */}
			<Menu
				anchorEl={userAnchor}
				open={Boolean(userAnchor)}
				onClose={() => setUserAnchor(null)}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
				transformOrigin={{ vertical: 'top', horizontal: 'right' }}
				sx={{ mt: '8px' }}
			>
				<MenuItem disabled sx={{ opacity: '1 !important', flexDirection: 'column', alignItems: 'flex-start' }}>
					<strong>{user?.memberNick}</strong>
					<span style={{ fontSize: 12, textTransform: 'capitalize' }}>{user?.memberType?.toLowerCase()}</span>
				</MenuItem>
				<Divider />
				<MenuItem
					onClick={() => {
						setUserAnchor(null);
						router.push('/mypage').then();
					}}
				>
					<PersonOutlineRoundedIcon fontSize="small" sx={{ mr: '10px' }} />
					{t('My Page')}
				</MenuItem>
				{!isAdmin(user) && (
					<MenuItem
						onClick={() => {
							setUserAnchor(null);
							router.push(MY_ORDERS_HREF).then();
						}}
					>
						<ReceiptLongOutlinedIcon fontSize="small" sx={{ mr: '10px' }} />
						{t('My orders')}
					</MenuItem>
				)}
				{isAgent(user) && (
					<MenuItem
						onClick={() => {
							setUserAnchor(null);
							router.push(ADD_PRODUCT_HREF).then();
						}}
					>
						<AddCircleOutlineRoundedIcon fontSize="small" sx={{ mr: '10px' }} />
						{t('Add product')}
					</MenuItem>
				)}
				{user?.memberType === 'ADMIN' && (
					<MenuItem
						onClick={() => {
							setUserAnchor(null);
							router.push('/_admin/users').then();
						}}
					>
						<DashboardOutlinedIcon fontSize="small" sx={{ mr: '10px' }} />
						{t('Admin panel')}
					</MenuItem>
				)}
				<MenuItem onClick={() => logOut()}>
					<LogoutRoundedIcon fontSize="small" sx={{ mr: '10px' }} />
					{t('Logout')}
				</MenuItem>
			</Menu>

			{/* notifications */}
			<Popover
				anchorEl={notifAnchor}
				open={Boolean(notifAnchor)}
				onClose={() => setNotifAnchor(null)}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
				transformOrigin={{ vertical: 'top', horizontal: 'right' }}
				sx={{ mt: '10px' }}
				PaperProps={{ sx: { borderRadius: '16px' } }}
			>
				<div className={'fx-notif-panel'}>
					<div className={'panel-head'}>
						<strong>{t('Notifications')}</strong>
						{unreadCount > 0 && <button onClick={readAllHandler}>{t('Mark all as read')}</button>}
					</div>
					<div className={'panel-list'}>
						{notifications.length === 0 ? (
							<div className={'panel-empty'}>{t('No notifications yet')}</div>
						) : (
							notifications.map((notification) => {
								const unread = notification.notificationStatus === NotificationStatus.WAIT;
								return (
									<div
										key={notification._id}
										className={`notif-item ${unread ? 'unread' : ''}`}
										onClick={() => openNotificationHandler(notification)}
									>
										<img src={memberImageUrl(notification.authorData?.memberImage)} alt="" />
										<div className={'txt'}>
											<strong>
												{notification.authorData?.memberNick ?? t('Someone')} {t(notificationAction(notification))}
											</strong>
											{notification.notificationDesc && <p>{notification.notificationDesc}</p>}
											<span>{timeAgo(notification.createdAt)}</span>
										</div>
										{unread && <div className={'unread-dot'} />}
									</div>
								);
							})
						)}
					</div>
				</div>
			</Popover>

			{/* mobile drawer */}
			<Drawer anchor={'right'} open={drawerOpen} onClose={() => setDrawerOpen(false)}>
				<div className={'fx-drawer'}>
					<div className={'drawer-head'}>
						<img src="/img/furniture/logo.svg" alt="Furniture" />
						<button className={'fx-icon-btn'} onClick={() => setDrawerOpen(false)} aria-label={'Close menu'}>
							<CloseRoundedIcon />
						</button>
					</div>
					{user?._id && (
						<div className={'drawer-user'}>
							<img src={memberImageUrl(user?.memberImage)} alt="" />
							<div>
								<strong>{user?.memberNick}</strong>
								<span>{user?.memberType?.toLowerCase()}</span>
							</div>
						</div>
					)}
					<nav className={'drawer-nav'}>
						{navLinks.map((link) => (
							<Link key={link.href} href={link.href} className={isActive(link.href) ? 'active' : ''}>
								{link.icon}
								{t(link.label)}
							</Link>
						))}
						{user?._id && (
							<Link href={'/mypage'} className={isActive('/mypage') ? 'active' : ''}>
								<PersonOutlineRoundedIcon />
								{t('My Page')}
							</Link>
						)}
						{user?._id && !isAdmin(user) && (
							<Link href={'/cart'} className={isActive('/cart') ? 'active' : ''}>
								<ShoppingBagOutlinedIcon />
								{t('Cart')}
							</Link>
						)}
						{user?._id && !isAdmin(user) && (
							<Link href={MY_ORDERS_HREF}>
								<ReceiptLongOutlinedIcon />
								{t('My orders')}
							</Link>
						)}
						{isAgent(user) && (
							<Link href={ADD_PRODUCT_HREF}>
								<AddCircleOutlineRoundedIcon />
								{t('Add product')}
							</Link>
						)}
					</nav>
					<div className={'drawer-langs'}>
						{languages.map((l) => (
							<button key={l.id} className={l.id === lang ? 'active' : ''} onClick={() => langChoice(l.id)}>
								{l.id}
							</button>
						))}
					</div>
					<div className={'drawer-foot'}>
						{user?._id ? (
							<button className={'fx-btn outline block'} onClick={() => logOut()}>
								<LogoutRoundedIcon fontSize="small" />
								{t('Logout')}
							</button>
						) : (
							<Link href={'/account/join'} className={'fx-btn primary block'}>
								{t('Login')} / {t('Register')}
							</Link>
						)}
					</div>
				</div>
			</Drawer>
		</>
	);
};

export default Top;
