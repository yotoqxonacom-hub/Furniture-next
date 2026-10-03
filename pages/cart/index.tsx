import React, { useEffect, useMemo } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useQuery, useReactiveVar } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { CircularProgress } from '@mui/material';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import withLayoutFull from '../../libs/components/layout/LayoutFull';
import QuantityStepper from '../../libs/components/common/QuantityStepper';
import PriceSummary from '../../libs/components/order/PriceSummary';
import { GET_MY_CART } from '../../apollo/user/query';
import { useCartActions } from '../../libs/hooks/useCart';
import { userVar } from '../../apollo/store';
import { getJwtToken } from '../../libs/auth';
import { Cart, CartItem } from '../../libs/types/cart/cart';
import { ProductStatus, productTypeLabel } from '../../libs/enums/product.enum';
import { deliveryFeeFor, ORDER_RULES } from '../../libs/config';
import { capitalize, formatPrice, imageUrl, memberImageUrl } from '../../libs/utils';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

interface SellerGroup {
	sellerId: string;
	sellerName: string;
	sellerImage?: string;
	items: CartItem[];
	subtotal: number;
}

const isBuyable = (item: CartItem) => item.productData?.productStatus === ProductStatus.ACTIVE;

/** cart rows grouped by seller, because every seller ships (and charges delivery) separately */
const groupBySeller = (items: CartItem[]): SellerGroup[] => {
	const groups = new Map<string, SellerGroup>();
	for (const item of items) {
		const seller = item.productData?.memberData;
		const sellerId = item.productData?.memberId ?? 'unknown';
		const group = groups.get(sellerId) ?? {
			sellerId,
			sellerName: seller?.memberFullName || seller?.memberNick || '—',
			sellerImage: seller?.memberImage,
			items: [],
			subtotal: 0,
		};
		group.items.push(item);
		if (isBuyable(item)) group.subtotal += (item.productData?.productPrice ?? 0) * item.quantity;
		groups.set(sellerId, group);
	}
	return [...groups.values()];
};

const CartPage: NextPage = () => {
	const router = useRouter();
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const { updateQuantity, removeItem } = useCartActions();

	/** APOLLO REQUESTS **/
	const { data, loading, refetch } = useQuery(GET_MY_CART, {
		fetchPolicy: 'network-only',
		skip: !user?._id, // the member is restored from the token after mount
		notifyOnNetworkStatusChange: true,
	});
	const cart: Cart | undefined = data?.getMyCart;
	const groups = useMemo(() => groupBySeller(cart?.list ?? []), [cart]);
	const buyableCount = (cart?.list ?? []).filter(isBuyable).length;

	/** LIFECYCLES **/
	useEffect(() => {
		if (!getJwtToken()) router.replace('/account/join').then();
	}, []);

	/** HANDLERS **/
	const quantityHandler = async (productId: string, quantity: number) => {
		if (await updateQuantity(productId, quantity)) await refetch();
	};

	const removeHandler = async (productId: string) => {
		if (await removeItem(productId)) await refetch();
	};

	if (!user?._id || (loading && !cart)) {
		return (
			<div className={'fx-order-page fx-center'}>
				<CircularProgress />
			</div>
		);
	}

	return (
		<div className={'fx-order-page cart-page'}>
			<div className={'fx-container'}>
				<div className={'page-head'}>
					<h1>{t('Your cart')}</h1>
					{cart && cart.totalQuantity > 0 && (
						<span className={'count'}>
							{cart.totalQuantity} {t('pcs')}
						</span>
					)}
				</div>

				{!cart?.list.length ? (
					<div className={'fx-empty'}>
						<img src="/img/furniture/placeholder.svg" alt="" />
						<strong>{t('Your cart is empty')}</strong>
						<span>{t('Find a piece you love and add it to the cart.')}</span>
						<Link href={'/product'} className={'fx-btn primary sm'}>
							{t('Go to shop')}
						</Link>
					</div>
				) : (
					<div className={'order-layout'}>
						<div className={'order-main'}>
							{groups.map((group) => {
								const fee = group.subtotal > 0 ? deliveryFeeFor(group.subtotal) : 0;
								return (
									<section key={group.sellerId} className={'fx-card seller-group'}>
										<header className={'group-head'}>
											<Link href={{ pathname: '/agent/detail', query: { agentId: group.sellerId } }} className={'seller'}>
												<img src={memberImageUrl(group.sellerImage)} alt="" />
												<strong>{group.sellerName}</strong>
											</Link>
											<span className={`delivery ${fee === 0 ? 'free' : ''}`}>
												<LocalShippingOutlinedIcon />
												{fee === 0
													? t('Free delivery')
													: `${t('Delivery')} ${formatPrice(fee)} · ${t('free from')} ${formatPrice(ORDER_RULES.FREE_DELIVERY_FROM)}`}
											</span>
										</header>

										{group.items.map((item) => {
											const product = item.productData;
											const buyable = isBuyable(item);
											const max = Math.min(product?.productStock ?? 1, ORDER_RULES.MAX_CART_QUANTITY);
											return (
												<div key={item._id} className={`cart-row ${buyable ? '' : 'unavailable'}`}>
													<Link href={{ pathname: '/product/detail', query: { id: item.productId } }} className={'thumb'}>
														<img src={imageUrl(product?.productImages?.[0])} alt={product?.productTitle} />
													</Link>
													<div className={'info'}>
														<Link href={{ pathname: '/product/detail', query: { id: item.productId } }} className={'title'}>
															{product?.productTitle}
														</Link>
														<span className={'meta'}>
															{t(productTypeLabel[product?.productType ?? ''] ?? '')} · {t(capitalize(product?.productLocation))}
														</span>
														{buyable ? (
															<span className={'unit'}>
																{formatPrice(product?.productPrice)} / {t('pc')}
																{max <= 3 && <em> · {t('Only {{count}} left', { count: product?.productStock })}</em>}
															</span>
														) : (
															<span className={'fx-badge danger'}>{t('No longer available')}</span>
														)}
													</div>
													<div className={'controls'}>
														{buyable && (
															<QuantityStepper
																size="sm"
																value={item.quantity}
																max={Math.max(max, item.quantity)}
																onChange={(quantity) => quantityHandler(item.productId, quantity)}
															/>
														)}
														<strong className={'line-total'}>
															{buyable ? formatPrice((product?.productPrice ?? 0) * item.quantity) : '—'}
														</strong>
														<button
															className={'fx-icon-btn remove'}
															onClick={() => removeHandler(item.productId)}
															aria-label={t('Remove')}
														>
															<DeleteOutlineRoundedIcon />
														</button>
													</div>
												</div>
											);
										})}
									</section>
								);
							})}
						</div>

						<aside className={'order-side'}>
							<div className={'fx-card summary-card'}>
								<h2>{t('Order summary')}</h2>
								<PriceSummary subtotal={cart.subtotal} deliveryFee={cart.deliveryFee} total={cart.total} showRule />
								<button
									className={'fx-btn primary block'}
									disabled={buyableCount === 0}
									onClick={() => router.push('/order/checkout')}
								>
									{t('Checkout')}
									<ArrowForwardRoundedIcon fontSize="small" />
								</button>
								<Link href={'/product'} className={'fx-btn ghost block'}>
									{t('Continue shopping')}
								</Link>
							</div>
						</aside>
					</div>
				)}
			</div>
		</div>
	);
};

export default withLayoutFull(CartPage);
