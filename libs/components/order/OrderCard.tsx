import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { Order } from '../../types/order/order';
import OrderStatusBadge from './OrderStatusBadge';
import { formatDate, formatPrice, imageUrl, memberImageUrl, orderNumber } from '../../utils';

interface OrderCardProps {
	order: Order;
	/** buyer sees the seller, seller sees the buyer */
	viewer: 'buyer' | 'seller';
	actions?: React.ReactNode;
}

const MAX_THUMBS = 3;

const OrderCard = ({ order, viewer, actions }: OrderCardProps) => {
	const { t } = useTranslation('common');
	const items = order.orderItems ?? [];
	const party = viewer === 'buyer' ? order.agentData : order.memberData;
	const pieces = items.reduce((sum, item) => sum + item.itemQuantity, 0);
	const detailHref = { pathname: '/order/detail', query: { orderId: order._id } };

	return (
		<article className={'fx-order-card'}>
			<header>
				<div className={'no'}>
					<strong>{orderNumber(order._id)}</strong>
					<span>{formatDate(order.createdAt)}</span>
				</div>
				<OrderStatusBadge status={order.orderStatus} />
			</header>

			<Link href={detailHref} className={'body'}>
				<div className={'thumbs'}>
					{items.slice(0, MAX_THUMBS).map((item) => (
						<img key={item._id} src={imageUrl(item.productImage)} alt={item.productTitle} loading="lazy" />
					))}
					{items.length > MAX_THUMBS && <span className={'more'}>+{items.length - MAX_THUMBS}</span>}
				</div>
				<div className={'info'}>
					<strong className={'title'}>
						{items[0]?.productTitle}
						{items.length > 1 && ` ${t('and')} ${items.length - 1} ${t('more')}`}
					</strong>
					<span className={'party'}>
						<img src={memberImageUrl(party?.memberImage)} alt="" />
						{viewer === 'buyer' ? t('Seller') : t('Buyer')}: {party?.memberFullName || party?.memberNick || '—'}
					</span>
					<span className={'meta'}>
						{pieces} {t('pcs')} · {t('Total')} <b>{formatPrice(order.orderTotal)}</b>
					</span>
				</div>
				<ChevronRightRoundedIcon className={'chevron'} />
			</Link>

			{actions && <footer>{actions}</footer>}
		</article>
	);
};

export default OrderCard;
