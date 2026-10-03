import React, { useEffect, useMemo, useState } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { CircularProgress } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import withLayoutFull from '../../libs/components/layout/LayoutFull';
import PaymentMethodPicker from '../../libs/components/order/PaymentMethodPicker';
import PriceSummary from '../../libs/components/order/PriceSummary';
import { GET_MY_CART } from '../../apollo/user/query';
import { CREATE_ORDERS, PAY_ORDERS } from '../../apollo/user/mutation';
import { userVar } from '../../apollo/store';
import { useCartActions } from '../../libs/hooks/useCart';
import { getJwtToken } from '../../libs/auth';
import { CartItem } from '../../libs/types/cart/cart';
import { ShippingAddress } from '../../libs/types/order/order';
import { ProductLocation, ProductStatus } from '../../libs/enums/product.enum';
import { PaymentMethod } from '../../libs/enums/payment.enum';
import { deliveryFeeFor, ORDER_RULES } from '../../libs/config';
import { MY_ORDERS_HREF } from '../../libs/member';
import { sweetErrorHandling, sweetMixinErrorAlert, sweetTopSuccessAlert } from '../../libs/sweetAlert';
import { capitalize, formatPrice, imageUrl } from '../../libs/utils';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const PHONE_PATTERN = /^\+?[0-9\s-]{7,20}$/;

const emptyAddress: ShippingAddress = { recipientName: '', recipientPhone: '', city: '' as ProductLocation, address: '', note: '' };

/** same checks as the backend ShippingAddressInput */
const addressErrors = (address: ShippingAddress): string[] => {
	const errors: string[] = [];
	if (address.recipientName.trim().length < 2) errors.push('Recipient name');
	if (!PHONE_PATTERN.test(address.recipientPhone.trim())) errors.push('Phone');
	if (!address.city) errors.push('City');
	if (address.address.trim().length < 5) errors.push('Address');
	return errors;
};

const Checkout: NextPage = () => {
	const router = useRouter();
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const { refreshCount } = useCartActions();
	const [address, setAddress] = useState<ShippingAddress>(emptyAddress);
	const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CARD);
	const [placing, setPlacing] = useState<boolean>(false);

	/** "Buy now" opens checkout with ?items=<productId>; otherwise the whole cart is bought */
	const requestedIds = useMemo(
		() => String(router.query.items ?? '').split(',').filter(Boolean),
		[router.query.items],
	);

	/** APOLLO REQUESTS **/
	const [createOrders] = useMutation(CREATE_ORDERS);
	const [payOrders] = useMutation(PAY_ORDERS);
	const { data, loading } = useQuery(GET_MY_CART, { fetchPolicy: 'network-only', skip: !user?._id });

	const items: CartItem[] = useMemo(
		() =>
			(data?.getMyCart?.list ?? []).filter(
				(item: CartItem) =>
					item.productData?.productStatus === ProductStatus.ACTIVE &&
					(requestedIds.length === 0 || requestedIds.includes(item.productId)),
			),
		[data, requestedIds],
	);

	/** preview of what the backend will charge: delivery fee per seller */
	const totals = useMemo(() => {
		const bySeller = new Map<string, number>();
		for (const item of items) {
			const seller = item.productData?.memberId ?? '';
			bySeller.set(seller, (bySeller.get(seller) ?? 0) + (item.productData?.productPrice ?? 0) * item.quantity);
		}
		const subtotals = [...bySeller.values()];
		const subtotal = subtotals.reduce((sum, value) => sum + value, 0);
		const deliveryFee = subtotals.reduce((sum, value) => sum + deliveryFeeFor(value), 0);
		return { subtotal, deliveryFee, total: subtotal + deliveryFee, sellers: subtotals.length };
	}, [items]);

	/** LIFECYCLES **/
	useEffect(() => {
		if (!getJwtToken()) router.replace('/account/join').then();
	}, []);

	useEffect(() => {
		// prefill the form from the profile once the member is known
		if (!user?._id) return;
		setAddress((prev) => ({
			...prev,
			recipientName: prev.recipientName || user.memberFullName || user.memberNick || '',
			recipientPhone: prev.recipientPhone || user.memberPhone || '',
			address: prev.address || user.memberAddress || '',
		}));
	}, [user?._id]);

	useEffect(() => {
		if (data && !loading && items.length === 0 && !placing) router.replace('/cart').then();
	}, [data, loading, items.length]);

	/** HANDLERS **/
	const change = (key: keyof ShippingAddress, value: string) => setAddress((prev) => ({ ...prev, [key]: value }));

	const placeOrderHandler = async (e: React.FormEvent) => {
		e.preventDefault();
		const errors = addressErrors(address);
		if (errors.length) {
			await sweetMixinErrorAlert(`${t('Please check')}: ${errors.map((error) => t(error)).join(', ')}`);
			return;
		}

		setPlacing(true);
		let orderIds: string[] = [];
		try {
			const shippingAddress: ShippingAddress = {
				recipientName: address.recipientName.trim(),
				recipientPhone: address.recipientPhone.trim(),
				city: address.city,
				address: address.address.trim(),
				...(address.note?.trim() ? { note: address.note.trim() } : {}),
			};
			const created = await createOrders({
				variables: { input: { shippingAddress, productIds: items.map((item) => item.productId) } },
			});
			orderIds = (created.data?.createOrders ?? []).map((order: { _id: string }) => order._id);
			await payOrders({ variables: { input: { orderIds, paymentMethod } } });

			await refreshCount();
			sweetTopSuccessAlert(t('Thank you! Your order has been placed.'), 2500).then();
			await router.replace(
				orderIds.length === 1 ? { pathname: '/order/detail', query: { orderId: orderIds[0] } } : MY_ORDERS_HREF,
			);
		} catch (err: any) {
			await sweetErrorHandling(err);
			if (orderIds.length) {
				// the orders exist but are unpaid: they wait in My orders for ORDER_RULES.PENDING_TTL_MINUTES
				await refreshCount();
				await router.replace(MY_ORDERS_HREF);
			}
			setPlacing(false);
		}
	};

	if (!user?._id || (loading && !data)) {
		return (
			<div className={'fx-order-page fx-center'}>
				<CircularProgress />
			</div>
		);
	}

	return (
		<div className={'fx-order-page checkout-page'}>
			<div className={'fx-container'}>
				<div className={'page-head'}>
					<Link href={'/cart'} className={'back'}>
						<ArrowBackRoundedIcon fontSize="small" />
						{t('Back to cart')}
					</Link>
					<h1>{t('Checkout')}</h1>
				</div>

				<form className={'order-layout'} onSubmit={placeOrderHandler} noValidate>
					<div className={'order-main'}>
						<section className={'fx-card'}>
							<h2 className={'card-title'}>
								<span className={'step'}>1</span>
								{t('Delivery address')}
							</h2>
							<div className={'fx-grid-2'}>
								<div className={'fx-field'}>
									<label htmlFor="recipientName">{t('Recipient name')}</label>
									<input
										id="recipientName"
										value={address.recipientName}
										onChange={(e) => change('recipientName', e.target.value)}
										maxLength={50}
										autoComplete="name"
									/>
								</div>
								<div className={'fx-field'}>
									<label htmlFor="recipientPhone">{t('Phone')}</label>
									<input
										id="recipientPhone"
										type="tel"
										value={address.recipientPhone}
										onChange={(e) => change('recipientPhone', e.target.value)}
										placeholder={'010 0000 0000'}
										autoComplete="tel"
									/>
								</div>
								<div className={'fx-field'}>
									<label htmlFor="city">{t('City')}</label>
									<select id="city" value={address.city} onChange={(e) => change('city', e.target.value)}>
										<option value="">{t('Choose a city')}</option>
										{Object.values(ProductLocation).map((city) => (
											<option key={city} value={city}>
												{t(capitalize(city))}
											</option>
										))}
									</select>
								</div>
								<div className={'fx-field'}>
									<label htmlFor="address">{t('Address')}</label>
									<input
										id="address"
										value={address.address}
										onChange={(e) => change('address', e.target.value)}
										placeholder={t('Street, building, apartment')}
										maxLength={200}
										autoComplete="street-address"
									/>
								</div>
							</div>
							<div className={'fx-field'} style={{ marginTop: 18 }}>
								<label htmlFor="note">{t('Note for the seller (optional)')}</label>
								<input
									id="note"
									value={address.note}
									onChange={(e) => change('note', e.target.value)}
									placeholder={t('e.g. call before delivery')}
									maxLength={200}
								/>
							</div>
						</section>

						<section className={'fx-card'}>
							<h2 className={'card-title'}>
								<span className={'step'}>2</span>
								{t('Payment method')}
							</h2>
							<PaymentMethodPicker value={paymentMethod} onChange={setPaymentMethod} />
							<p className={'secure-note'}>
								<LockOutlinedIcon />
								{t('Test mode: payments are approved instantly and no money is charged.')}
							</p>
						</section>
					</div>

					<aside className={'order-side'}>
						<div className={'fx-card summary-card'}>
							<h2>{t('Your order')}</h2>
							<ul className={'mini-items'}>
								{items.map((item) => (
									<li key={item._id}>
										<img src={imageUrl(item.productData?.productImages?.[0])} alt="" />
										<span className={'title'}>{item.productData?.productTitle}</span>
										<span className={'qty'}>×{item.quantity}</span>
										<strong>{formatPrice((item.productData?.productPrice ?? 0) * item.quantity)}</strong>
									</li>
								))}
							</ul>
							<PriceSummary subtotal={totals.subtotal} deliveryFee={totals.deliveryFee} total={totals.total} />
							{totals.sellers > 1 && (
								<p className={'split-note'}>
									{t('Items from {{count}} sellers arrive as separate orders.', { count: totals.sellers })}
								</p>
							)}
							<button className={'fx-btn primary block'} type="submit" disabled={placing || items.length === 0}>
								{placing ? <CircularProgress size={18} /> : <LockOutlinedIcon fontSize="small" />}
								{t('Pay')} {formatPrice(totals.total)}
							</button>
							<p className={'terms-note'}>
								{t('Unpaid orders are cancelled after {{count}} minutes.', { count: ORDER_RULES.PENDING_TTL_MINUTES })}
							</p>
						</div>
					</aside>
				</form>
			</div>
		</div>
	);
};

export default withLayoutFull(Checkout);
