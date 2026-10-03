import React from 'react';
import { useTranslation } from 'next-i18next';
import { OrderStatus, orderStatusLabel, orderStatusTone } from '../../enums/order.enum';

const OrderStatusBadge = ({ status }: { status: OrderStatus }) => {
	const { t } = useTranslation('common');
	return <span className={`fx-badge ${orderStatusTone[status]}`}>{t(orderStatusLabel[status])}</span>;
};

export default OrderStatusBadge;
