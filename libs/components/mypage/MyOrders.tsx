import React, { ChangeEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useQuery, useReactiveVar } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import { Pagination } from '@mui/material';
import OrderCard from '../order/OrderCard';
import useOrderActions from '../../hooks/useOrderActions';
import { GET_MY_ORDERS, GET_SELLER_ORDERS } from '../../../apollo/user/query';
import { userVar } from '../../../apollo/store';
import { Order } from '../../types/order/order';
import { OrdersInquiry } from '../../types/order/order.input';
import {
	BUYER_CANCELLABLE,
	ORDER_STATUS_FLOW,
	OrderStatus,
	orderStatusLabel,
	sellerActionLabel,
} from '../../enums/order.enum';
import { isAgent } from '../../member';

const LIMIT = 5;

/** buyer: "My orders"; seller: "Customer orders" (unpaid orders are not shown to sellers) */
const MODES = {
	buyer: {
		title: 'My orders',
		desc: 'Track your purchases, pay unpaid orders or cancel before the seller starts.',
		query: GET_MY_ORDERS,
		key: 'getMyOrders',
		statuses: Object.values(OrderStatus),
	},
	seller: {
		title: 'Customer orders',
		desc: 'Orders paid by your customers. Move each one to the next step.',
		query: GET_SELLER_ORDERS,
		key: 'getSellerOrders',
		statuses: Object.values(OrderStatus).filter((status) => status !== OrderStatus.PENDING),
	},
};

const MyOrders = ({ mode }: { mode: 'buyer' | 'seller' }) => {
	const router = useRouter();
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const config = MODES[mode];
	const [inquiry, setInquiry] = useState<OrdersInquiry>({
		page: 1,
		limit: LIMIT,
		sort: 'createdAt',
		direction: 'DESC' as any,
		search: {},
	});

	/** APOLLO REQUESTS **/
	const { data, loading, refetch } = useQuery(config.query, {
		fetchPolicy: 'network-only',
		variables: { input: inquiry },
		skip: !user?._id || (mode === 'seller' && !isAgent(user)),
		notifyOnNetworkStatusChange: true,
	});
	const orders: Order[] = data?.[config.key]?.list ?? [];
	const total: number = data?.[config.key]?.metaCounter?.[0]?.total ?? 0;
	const { cancelOrder, updateBySeller } = useOrderActions(() => refetch());

	/** LIFECYCLES **/
	useEffect(() => {
		if (mode === 'seller' && user?._id && !isAgent(user)) router.replace('/mypage?category=myOrders').then();
	}, [mode, user?._id, user?.memberType]);

	/** HANDLERS **/
	const statusHandler = (orderStatus?: OrderStatus) =>
		setInquiry((prev) => ({ ...prev, page: 1, search: orderStatus ? { orderStatus } : {} }));

	const buyerActions = (order: Order) => (
		<>
			{order.orderStatus === OrderStatus.PENDING && (
				<Link href={{ pathname: '/order/detail', query: { orderId: order._id } }} className={'fx-btn primary sm'}>
					{t('Pay now')}
				</Link>
			)}
			{BUYER_CANCELLABLE.includes(order.orderStatus) && (
				<button className={'fx-btn outline sm'} onClick={() => cancelOrder(order._id)}>
					{t('Cancel')}
				</button>
			)}
		</>
	);

	const sellerActions = (order: Order) =>
		ORDER_STATUS_FLOW[order.orderStatus]
			.filter((next) => next !== OrderStatus.CANCELLED)
			.map((next) => (
				<button key={next} className={'fx-btn primary sm'} onClick={() => updateBySeller(order._id, next)}>
					{t(sellerActionLabel[next] ?? next)}
				</button>
			));

	return (
		<div className={'my-section'}>
			<div className={'my-head'}>
				<div>
					<h2>{t(config.title)}</h2>
					<p>{t(config.desc)}</p>
				</div>
			</div>

			<div className={'fx-chip-row'} style={{ marginBottom: 18 }}>
				<button className={`fx-chip ${!inquiry.search.orderStatus ? 'active' : ''}`} onClick={() => statusHandler()}>
					{t('All')}
				</button>
				{config.statuses.map((status) => (
					<button
						key={status}
						className={`fx-chip ${inquiry.search.orderStatus === status ? 'active' : ''}`}
						onClick={() => statusHandler(status)}
					>
						{t(orderStatusLabel[status])}
					</button>
				))}
			</div>

			{!loading && orders.length === 0 ? (
				<div className={'fx-empty'}>
					<img src="/img/furniture/placeholder.svg" alt="" />
					<strong>{t('No orders here yet')}</strong>
					{mode === 'buyer' && (
						<Link href={'/product'} className={'fx-btn outline sm'}>
							{t('Go to shop')}
						</Link>
					)}
				</div>
			) : (
				<div className={'order-list'}>
					{orders.map((order) => {
						const actions = mode === 'buyer' ? buyerActions(order) : sellerActions(order);
						return <OrderCard key={order._id} order={order} viewer={mode} actions={actions} />;
					})}
				</div>
			)}

			{total > LIMIT && (
				<div className={'fx-pagination'}>
					<Pagination
						page={inquiry.page}
						count={Math.ceil(total / LIMIT)}
						onChange={(_: ChangeEvent<unknown>, page: number) => setInquiry((prev) => ({ ...prev, page }))}
						shape="circular"
					/>
				</div>
			)}
		</div>
	);
};

export default MyOrders;
