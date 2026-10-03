import { useMutation } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import { CANCEL_ORDER, PAY_ORDERS, UPDATE_ORDER_STATUS_BY_SELLER } from '../../apollo/user/mutation';
import { OrderStatus, orderStatusLabel } from '../enums/order.enum';
import { PaymentMethod } from '../enums/payment.enum';
import { sweetConfirmAlert, sweetErrorHandling, sweetTopSmallSuccessAlert } from '../sweetAlert';

/** Buyer and seller actions on an order; `onDone` usually refetches the page data */
const useOrderActions = (onDone?: () => Promise<unknown> | void) => {
	const { t } = useTranslation('common');
	const [cancelOrderMutation] = useMutation(CANCEL_ORDER);
	const [payOrdersMutation] = useMutation(PAY_ORDERS);
	const [updateBySellerMutation] = useMutation(UPDATE_ORDER_STATUS_BY_SELLER);

	const run = async (action: () => Promise<unknown>, successText: string): Promise<boolean> => {
		try {
			await action();
			if (onDone) await onDone();
			sweetTopSmallSuccessAlert(t(successText), 1000).then();
			return true;
		} catch (err: any) {
			await sweetErrorHandling(err);
			return false;
		}
	};

	/** buyer: cancel before the seller starts preparing (stock goes back, a paid order is refunded) */
	const cancelOrder = async (orderId: string): Promise<boolean> => {
		if (!(await sweetConfirmAlert(t('Cancel this order? Paid orders are refunded.')))) return false;
		return run(() => cancelOrderMutation({ variables: { orderId } }), 'Order cancelled');
	};

	/** buyer: pay unpaid orders */
	const payOrders = (orderIds: string[], paymentMethod: PaymentMethod) =>
		run(() => payOrdersMutation({ variables: { input: { orderIds, paymentMethod } } }), 'Payment completed');

	/** seller: next step (Preparing → Shipped → Delivered) or cancel */
	const updateBySeller = async (orderId: string, orderStatus: OrderStatus): Promise<boolean> => {
		const question =
			orderStatus === OrderStatus.CANCELLED
				? t('Cancel this order? The buyer is refunded.')
				: `${t('Change status to')} ${t(orderStatusLabel[orderStatus])}?`;
		if (!(await sweetConfirmAlert(question))) return false;
		return run(() => updateBySellerMutation({ variables: { input: { orderId, orderStatus } } }), 'Updated');
	};

	return { cancelOrder, payOrders, updateBySeller };
};

export default useOrderActions;
