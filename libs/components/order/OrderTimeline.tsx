import React from 'react';
import { useTranslation } from 'next-i18next';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { Order } from '../../types/order/order';
import { ORDER_STEPS, OrderStatus } from '../../enums/order.enum';
import { formatDate } from '../../utils';

const STEP_LABEL: Record<string, string> = {
	[OrderStatus.PENDING]: 'Order placed',
	[OrderStatus.PAID]: 'Paid',
	[OrderStatus.PROCESSING]: 'Preparing',
	[OrderStatus.SHIPPED]: 'Shipped',
	[OrderStatus.DELIVERED]: 'Delivered',
};

const STEP_DATE: Record<string, keyof Order> = {
	[OrderStatus.PENDING]: 'createdAt',
	[OrderStatus.PAID]: 'paidAt',
	[OrderStatus.PROCESSING]: 'processedAt',
	[OrderStatus.SHIPPED]: 'shippedAt',
	[OrderStatus.DELIVERED]: 'deliveredAt',
};

/** Placed → Paid → Preparing → Shipped → Delivered; a cancelled order stops at the step it reached */
const OrderTimeline = ({ order }: { order: Order }) => {
	const { t } = useTranslation('common');
	const cancelled = order.orderStatus === OrderStatus.CANCELLED;
	const reached = cancelled
		? ORDER_STEPS.filter((step) => Boolean(order[STEP_DATE[step]])).length - 1
		: ORDER_STEPS.indexOf(order.orderStatus);
	const steps = cancelled ? ORDER_STEPS.slice(0, reached + 1) : ORDER_STEPS;

	return (
		<ol className={`fx-order-timeline ${cancelled ? 'is-cancelled' : ''}`}>
			{steps.map((step, index) => {
				const date = order[STEP_DATE[step]] as Date | undefined;
				const state = index < reached ? 'done' : index === reached ? 'current' : 'todo';
				return (
					<li key={step} className={state}>
						<span className={'dot'}>{index <= reached && <CheckRoundedIcon />}</span>
						<strong>{t(STEP_LABEL[step])}</strong>
						<small>{date ? formatDate(date, true) : '—'}</small>
					</li>
				);
			})}
			{cancelled && (
				<li className={'cancelled current'}>
					<span className={'dot'}>
						<CloseRoundedIcon />
					</span>
					<strong>{t('Cancelled')}</strong>
					<small>{formatDate(order.cancelledAt, true)}</small>
				</li>
			)}
		</ol>
	);
};

export default OrderTimeline;
