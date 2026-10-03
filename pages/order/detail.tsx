import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useQuery, useReactiveVar } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { CircularProgress } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import withLayoutFull from '../../libs/components/layout/LayoutFull';
import OrderStatusBadge from '../../libs/components/order/OrderStatusBadge';
import OrderTimeline from '../../libs/components/order/OrderTimeline';
import PriceSummary from '../../libs/components/order/PriceSummary';
import PaymentMethodPicker from '../../libs/components/order/PaymentMethodPicker';
import useOrderActions from '../../libs/hooks/useOrderActions';
import { GET_ORDER } from '../../apollo/user/query';
import { userVar } from '../../apollo/store';
import { getJwtToken } from '../../libs/auth';
import { openChatWith } from '../../libs/chat';
import { Order } from '../../libs/types/order/order';
import { BUYER_CANCELLABLE, ORDER_STATUS_FLOW, OrderStatus, sellerActionLabel } from '../../libs/enums/order.enum';
import { PaymentMethod } from '../../libs/enums/payment.enum';
import { MY_ORDERS_HREF, SELLER_ORDERS_HREF } from '../../libs/member';
import { ORDER_RULES } from '../../libs/config';
import { capitalize, formatDate, formatPrice, imageUrl, memberImageUrl, orderNumber } from '../../libs/utils';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const OrderDetail: NextPage = () => {
	const router = useRouter();
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const orderId = router.query.orderId as string | undefined;
	const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CARD);

	/** APOLLO REQUESTS **/
	const { data, loading, refetch } = useQuery(GET_ORDER, {
		fetchPolicy: 'network-only',
		variables: { input: orderId },
		skip: !orderId || !user?._id,
		notifyOnNetworkStatusChange: true,
	});
	const order: Order | undefined = data?.getOrder;
	const { cancelOrder, payOrders, updateBySeller } = useOrderActions(() => refetch());

	/** LIFECYCLES **/
	useEffect(() => {
		if (!getJwtToken()) router.replace('/account/join').then();
	}, []);

	if (!user?._id || (loading && !order)) {
		return (
			<div className={'fx-order-page fx-center'}>
				<CircularProgress />
			</div>
		);
	}

	if (!order) {
		return (
			<div className={'fx-order-page'}>
				<div className={'fx-container'}>
					<div className={'fx-empty'}>
						<strong>{t('Order not found')}</strong>
						<Link href={MY_ORDERS_HREF} className={'fx-btn outline sm'}>
							{t('My orders')}
						</Link>
					</div>
				</div>
			</div>
		);
	}

	const isBuyer = user._id === order.memberId;
	const isSeller = user._id === order.agentId;
	const party = isBuyer ? order.agentData : order.memberData;
	const status = order.orderStatus;
	const sellerSteps = ORDER_STATUS_FLOW[status].filter((next) => next !== OrderStatus.CANCELLED);
	const sellerCanCancel = isSeller && status !== OrderStatus.PENDING && ORDER_STATUS_FLOW[status].includes(OrderStatus.CANCELLED);
	const buyerCanCancel = isBuyer && BUYER_CANCELLABLE.includes(status);
	const hasActions = (isBuyer && (status === OrderStatus.PENDING || buyerCanCancel)) || (isSeller && (sellerSteps.length > 0 || sellerCanCancel));

	return (
		<div className={'fx-order-page order-detail-page'}>
			<div className={'fx-container'}>
				<div className={'page-head'}>
					<Link href={isSeller ? SELLER_ORDERS_HREF : MY_ORDERS_HREF} className={'back'}>
						<ArrowBackRoundedIcon fontSize="small" />
						{isSeller ? t('Customer orders') : t('My orders')}
					</Link>
					<div className={'title-row'}>
						<h1>
							{t('Order')} {orderNumber(order._id)}
						</h1>
						<OrderStatusBadge status={status} />
					</div>
					<span className={'sub'}>{formatDate(order.createdAt, true)}</span>
				</div>

				<section className={'fx-card timeline-card'}>
					<OrderTimeline order={order} />
					{status === OrderStatus.CANCELLED && order.cancelReason && (
						<p className={'cancel-reason'}>
							{t('Reason')}: {order.cancelReason}
						</p>
					)}
				</section>

				<div className={'order-layout'}>
					<div className={'order-main'}>
						<section className={'fx-card'}>
							<h2 className={'card-title'}>{t('Items')}</h2>
							<ul className={'order-items'}>
								{(order.orderItems ?? []).map((item) => (
									<li key={item._id}>
										<Link href={{ pathname: '/product/detail', query: { id: item.productId } }} className={'thumb'}>
											<img src={imageUrl(item.productImage)} alt={item.productTitle} />
										</Link>
										<div className={'info'}>
											<Link href={{ pathname: '/product/detail', query: { id: item.productId } }} className={'title'}>
												{item.productTitle}
											</Link>
											<span className={'meta'}>
												{formatPrice(item.itemPrice)} × {item.itemQuantity}
											</span>
										</div>
										<strong>{formatPrice(item.itemPrice * item.itemQuantity)}</strong>
									</li>
								))}
							</ul>
						</section>

						{hasActions && (
							<section className={'fx-card actions-card'}>
								<h2 className={'card-title'}>{isSeller ? t('Next step') : t('Actions')}</h2>

								{isBuyer && status === OrderStatus.PENDING && (
									<>
										<p className={'hint'}>
											{t('This order is not paid yet. Unpaid orders are cancelled after {{count}} minutes.', {
												count: ORDER_RULES.PENDING_TTL_MINUTES,
											})}
										</p>
										<PaymentMethodPicker value={paymentMethod} onChange={setPaymentMethod} compact />
									</>
								)}

								<div className={'action-row'}>
									{isBuyer && status === OrderStatus.PENDING && (
										<button className={'fx-btn primary'} onClick={() => payOrders([order._id], paymentMethod)}>
											{t('Pay')} {formatPrice(order.orderTotal)}
										</button>
									)}
									{isSeller &&
										sellerSteps.map((next) => (
											<button key={next} className={'fx-btn primary'} onClick={() => updateBySeller(order._id, next)}>
												{t(sellerActionLabel[next] ?? next)}
											</button>
										))}
									{buyerCanCancel && (
										<button className={'fx-btn outline'} onClick={() => cancelOrder(order._id)}>
											{t('Cancel order')}
										</button>
									)}
									{sellerCanCancel && (
										<button className={'fx-btn outline'} onClick={() => updateBySeller(order._id, OrderStatus.CANCELLED)}>
											{t('Cancel order')}
										</button>
									)}
								</div>
							</section>
						)}
					</div>

					<aside className={'order-side'}>
						<section className={'fx-card summary-card'}>
							<h2>{t('Payment')}</h2>
							<PriceSummary
								subtotal={order.orderSubtotal}
								deliveryFee={order.orderDeliveryFee}
								total={order.orderTotal}
							/>
							<p className={'paid-line'}>
								{order.paidAt ? `${t('Paid')} · ${formatDate(order.paidAt, true)}` : t('Not paid yet')}
							</p>
						</section>

						<section className={'fx-card'}>
							<h2 className={'card-title'}>{t('Delivery address')}</h2>
							<div className={'address'}>
								<strong>{order.shippingAddress.recipientName}</strong>
								<span>
									<PhoneOutlinedIcon />
									{order.shippingAddress.recipientPhone}
								</span>
								<span>
									<PlaceOutlinedIcon />
									{t(capitalize(order.shippingAddress.city))}, {order.shippingAddress.address}
								</span>
								{order.shippingAddress.note && <em>“{order.shippingAddress.note}”</em>}
							</div>
						</section>

						{party && (
							<section className={'fx-card party-card'}>
								<h2 className={'card-title'}>{isBuyer ? t('Seller') : t('Buyer')}</h2>
								<div className={'party'}>
									<img src={memberImageUrl(party.memberImage)} alt="" />
									<strong>{party.memberFullName || party.memberNick}</strong>
								</div>
								<button className={'fx-btn outline sm block'} onClick={() => openChatWith(party)}>
									<ChatBubbleOutlineRoundedIcon fontSize="small" />
									{t('Send message')}
								</button>
							</section>
						)}
					</aside>
				</div>
			</div>
		</div>
	);
};

export default withLayoutFull(OrderDetail);
